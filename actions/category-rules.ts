"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const INCOME_CATEGORIES = ["WYPLATA_1", "WYPLATA_2", "INNE"] as const;
const EXPENSE_CATEGORIES = [
  "ZAKUPY",
  "RESTAURACJE",
  "TRANSPORT",
  "SUBSCRIPTIONS",
  "MIESZKANIE",
  "FUN",
  "OTHER",
] as const;

export async function getCategoryRules() {
  try {
    return await prisma.categoryRule.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function addCategoryRule(formData: FormData) {
  const pattern = (formData.get("pattern") as string).toLowerCase().trim();
  const type = formData.get("type") as string;
  const category = formData.get("category") as string;

  await prisma.categoryRule.upsert({
    where: { pattern_type: { pattern, type } },
    update: { category },
    create: { pattern, type, category },
  });

  revalidatePath("/import");
}

export async function deleteCategoryRule(id: string) {
  await prisma.categoryRule.delete({ where: { id } });
  revalidatePath("/import");
}

export interface MatchedCategory {
  category: string;
  source: "rule" | "ai" | "heuristic" | "default";
}

interface TxToMatch {
  description: string;
  type: "income" | "expense";
  date?: string;
}

interface UnmatchedTx extends TxToMatch {
  index: number;
  normalized: string;
}

export async function matchCategory(
  description: string,
  type: "income" | "expense",
  date?: string
): Promise<MatchedCategory> {
  const rules = await getCategoryRules();
  const normalized = normalizeForMatch(description);

  for (const rule of rules) {
    if (
      rule.type === type &&
      normalized.includes(normalizeForMatch(rule.pattern))
    ) {
      return { category: rule.category, source: "rule" };
    }
  }

  const heuristic = inferCategoryFromText(normalized, type, date);
  if (heuristic) return { category: heuristic, source: "heuristic" };

  return {
    category: type === "expense" ? "OTHER" : "INNE",
    source: "default",
  };
}

export async function matchCategoriesBulk(
  transactions: TxToMatch[]
): Promise<MatchedCategory[]> {
  const rules = await getCategoryRules();
  const normalizedRules = rules.map((r) => ({
    type: r.type,
    category: r.category,
    pattern: normalizeForMatch(r.pattern),
  }));

  const matched: Array<MatchedCategory | null> = Array.from(
    { length: transactions.length },
    () => null
  );
  const unmatched: UnmatchedTx[] = [];

  transactions.forEach((tx, index) => {
    const normalized = normalizeForMatch(tx.description);

    for (const rule of normalizedRules) {
      if (rule.type === tx.type && normalized.includes(rule.pattern)) {
        matched[index] = { category: rule.category, source: "rule" };
        return;
      }
    }

    unmatched.push({ ...tx, index, normalized });
  });

  if (unmatched.length > 0) {
    const aiMatches = await classifyWithGemini(unmatched);

    for (const tx of unmatched) {
      const aiCategory = aiMatches.get(tx.index);

      if (aiCategory && isCategoryAllowed(aiCategory, tx.type)) {
        matched[tx.index] = { category: aiCategory, source: "ai" };
        continue;
      }

      const heuristic = inferCategoryFromText(tx.normalized, tx.type, tx.date);
      if (heuristic) {
        matched[tx.index] = { category: heuristic, source: "heuristic" };
        continue;
      }

      matched[tx.index] = {
        category: tx.type === "expense" ? "OTHER" : "INNE",
        source: "default",
      };
    }
  }

  return matched.map((item, idx) => {
    if (item) return item;
    return {
      category: transactions[idx]?.type === "expense" ? "OTHER" : "INNE",
      source: "default" as const,
    };
  });
}

async function classifyWithGemini(
  items: UnmatchedTx[]
): Promise<Map<number, string>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || items.length === 0) return new Map();

  const out = new Map<number, string>();
  const chunkSize = 120;

  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildGeminiPrompt(chunk) }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("Gemini category API error:", err);
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const parsed = parseGeminiResult(text, chunk);

      for (const [index, category] of parsed.entries()) {
        out.set(index, category);
      }
    } catch (error) {
      console.error("Gemini category API request failed:", error);
    }
  }

  return out;
}

function buildGeminiPrompt(items: UnmatchedTx[]): string {
  const payload = items.map((item) => ({
    i: item.index,
    type: item.type,
    date: item.date || "",
    description: item.description.slice(0, 220),
    normalized: item.normalized.slice(0, 220),
  }));

  return `Klasyfikujesz transakcje bankowe do kategorii finansowych.

DOZWOLONE KATEGORIE DLA expense:
${EXPENSE_CATEGORIES.join(", ")}

DOZWOLONE KATEGORIE DLA income:
${INCOME_CATEGORIES.join(", ")}

Zasady:
- Używaj wyłącznie kategorii dozwolonych dla typu transakcji.
- Jeśli nie jesteś pewien:
  - expense -> OTHER
  - income -> INNE
- Nie zmieniaj indeksu "i".
- Odpowiedz WYŁĄCZNIE JSON:
{"results":[{"i":123,"category":"ZAKUPY"}]}

TRANSAKCJE:
${JSON.stringify(payload)}`;
}

function parseGeminiResult(text: string, chunk: UnmatchedTx[]): Map<number, string> {
  const out = new Map<number, string>();
  if (!text) return out;

  const parsed = safeParseGeminiJson(text);
  if (!parsed) return out;

  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "results" in parsed &&
    Array.isArray((parsed as { results?: unknown[] }).results)
  ) {
    for (const row of (parsed as { results: unknown[] }).results) {
      if (!row || typeof row !== "object") continue;
      const i = Number((row as { i?: unknown }).i);
      const category = normalizeCategoryValue((row as { category?: unknown }).category);
      if (!Number.isInteger(i) || !category) continue;
      out.set(i, category);
    }
    return out;
  }

  if (Array.isArray(parsed)) {
    const asStringArray = parsed.every((item) => typeof item === "string");
    if (asStringArray && parsed.length === chunk.length) {
      for (let i = 0; i < parsed.length; i++) {
        const category = normalizeCategoryValue(parsed[i]);
        if (!category) continue;
        out.set(chunk[i].index, category);
      }
      return out;
    }

    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const i = Number((row as { i?: unknown }).i);
      const category = normalizeCategoryValue((row as { category?: unknown }).category);
      if (!Number.isInteger(i) || !category) continue;
      out.set(i, category);
    }
  }

  return out;
}

function safeParseGeminiJson(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        // ignore
      }
    }

    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // ignore
      }
    }
  }
  return null;
}

function normalizeCategoryValue(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase().replace(/\s+/g, "_");
  return normalized || null;
}

function isCategoryAllowed(
  category: string,
  type: "income" | "expense"
): boolean {
  return type === "expense"
    ? EXPENSE_CATEGORIES.includes(category as (typeof EXPENSE_CATEGORIES)[number])
    : INCOME_CATEGORIES.includes(category as (typeof INCOME_CATEGORIES)[number]);
}

function inferCategoryFromText(
  normalizedDescription: string,
  type: "income" | "expense",
  date?: string
): string | null {
  if (!normalizedDescription) return null;

  if (type === "income") {
    const hasSalarySignal = hasAny(normalizedDescription, [
      "wynagrodzenie",
      "pensja",
      "wynagr",
      "salary",
      "payroll",
      "wyplata",
      "wplata wynagrodzenia",
      "grupa",
      "jobme",
      "przelew wynagrodzenia",
      "przelew pensji",
      "express elixir",
    ]);
    const hasEmployerSignal = hasAny(normalizedDescription, [
      "spolka",
      "sp z o o",
      "spolka akcyjna",
      "s a",
      " sa ",
      "ltd",
      "llc",
      "company",
      "pracodawca",
    ]);

    if (
      hasSalarySignal ||
      (hasEmployerSignal &&
        hasAny(normalizedDescription, ["przelew", "express", "elixir"]))
    ) {
      if (
        hasAny(normalizedDescription, [
          "wyplata 2",
          "druga wyplata",
          "wypata 2",
          "u 01",
          "u 02",
          "u 2",
          "25 dnia",
          "drugie wynagrodzenie",
        ])
      ) {
        return "WYPLATA_2";
      }

      if (
        hasAny(normalizedDescription, [
          "wyplata 1",
          "pierwsza wyplata",
          "u 12",
          "u 11",
          "u 1",
          "10 dnia",
          "pierwsze wynagrodzenie",
        ])
      ) {
        return "WYPLATA_1";
      }

      const day = extractDayFromIso(date);
      if (day >= 20) return "WYPLATA_2";
      if (day >= 1 && day <= 15) return "WYPLATA_1";
      return "WYPLATA_1";
    }

    if (
      hasAny(normalizedDescription, [
        "blik p2p przychodzacy",
        "przelew na telefon",
        "zwrot",
        "refund",
        "cashback",
        "odsetki",
        "bonus",
      ])
    ) {
      return "INNE";
    }

    return null;
  }

  const expenseHeuristics: Array<{ category: string; patterns: string[] }> = [
    {
      category: "RESTAURACJE",
      patterns: [
        "uber eats",
        "glovo",
        "pyszne",
        "pizza",
        "kebab",
        "sushi",
        "restaur",
        "mcdonald",
        "kfc",
        "burger king",
        "starbucks",
        "coffee",
        "cafe",
      ],
    },
    {
      category: "TRANSPORT",
      patterns: [
        "koleo",
        "pkp",
        "mpk",
        "jakdojade",
        "uber",
        "bolt",
        "orlen",
        "lotos",
        "circle k",
        "shell",
        "stacja paliw",
        "autostrada",
        "parking",
        "flixbus",
        "ryanair",
        "wizzair",
        "lot",
        "taxi",
      ],
    },
    {
      category: "SUBSCRIPTIONS",
      patterns: [
        "netflix",
        "spotify",
        "youtube",
        "google one",
        "icloud",
        "apple com bill",
        "apple.com/bill",
        "prime video",
        "disney",
        "hbo",
        "max com",
        "canal",
        "chatgpt",
        "openai",
        "patreon",
        "game pass",
      ],
    },
    {
      category: "MIESZKANIE",
      patterns: [
        "czynsz",
        "najem",
        "oplata",
        "energia",
        "tauron",
        "pge",
        "enea",
        "energa",
        "gaz",
        "pgnig",
        "woda",
        "mpwik",
        "internet",
        "orange",
        "play",
        "plus",
        "t mobile",
        "upc",
        "vectra",
      ],
    },
    {
      category: "ZAKUPY",
      patterns: [
        "zakup",
        "zakupy",
        "zakup przy uzyciu karty",
        "zakup e commerce",
        "e commerce",
        "ecommerce",
        "blik zakup",
        "platnosc karta",
        "biedronka",
        "zabka",
        "lidl",
        "kaufland",
        "auchan",
        "carrefour",
        "rossmann",
        "hebe",
        "aldi",
        "netto",
        "stokrotka",
        "intermarche",
        "frisco",
        "pepco",
        "apteka",
        "drogeria",
      ],
    },
    {
      category: "FUN",
      patterns: [
        "allegro",
        "amazon",
        "temu",
        "shein",
        "x kom",
        "media expert",
        "rtv euro agd",
        "steam",
        "epic games",
        "multikino",
        "cinema",
        "empik",
        "booking com",
        "airbnb",
        "booksy",
      ],
    },
  ];

  let bestCategory: string | null = null;
  let bestScore = 0;

  for (const h of expenseHeuristics) {
    const score = h.patterns.reduce(
      (sum, pattern) => (normalizedDescription.includes(pattern) ? sum + 1 : sum),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestCategory = h.category;
    }
  }

  return bestScore > 0 ? bestCategory : null;
}

function hasAny(text: string, patterns: string[]): boolean {
  return patterns.some((pattern) => text.includes(pattern));
}

function normalizeForMatch(value: string): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/ł/g, "l")
    .replace(/ą/g, "a")
    .replace(/ć/g, "c")
    .replace(/ę/g, "e")
    .replace(/ń/g, "n")
    .replace(/ó/g, "o")
    .replace(/ś/g, "s")
    .replace(/ż|ź/g, "z")
    .replace(/\uFFFD/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function extractDayFromIso(date?: string): number {
  if (!date) return 0;
  const match = date.match(/^\d{4}-\d{2}-(\d{2})$/);
  if (!match) return 0;
  const day = Number(match[1]);
  return Number.isFinite(day) ? day : 0;
}
