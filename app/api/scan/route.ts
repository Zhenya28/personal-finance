import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const INCOME_CATEGORIES = ["WYPLATA_1", "WYPLATA_2", "INNE"];
const EXPENSE_CATEGORIES = [
  "ZAKUPY",
  "RESTAURACJE",
  "TRANSPORT",
  "SUBSCRIPTIONS",
  "MIESZKANIE",
  "FUN",
  "OTHER",
];

function buildPrompt(type: "income" | "expense") {
  const categories =
    type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const categoryList = categories.join(", ");
  const today = new Date().toISOString().split("T")[0]; // e.g. "2026-02-22"
  const currentYear = new Date().getFullYear(); // e.g. 2026

  return `Analizujesz zdjęcie z aplikacji bankowej lub potwierdzenie transakcji. Wyciągnij WSZYSTKIE transakcje widoczne na obrazku.

DZISIEJSZA DATA: ${today}
BIEŻĄCY ROK: ${currentYear}

Typ transakcji: ${type === "income" ? "PRZYCHÓD (wpływy na konto)" : "WYDATEK (obciążenia konta)"}

Dla każdej transakcji podaj:
- "amount": kwota jako liczba DODATNIA (bez walut, bez minusa, np. 125.50)
- "category": jedna z kategorii: ${categoryList}
- "description": krótki opis transakcji (np. "Biedronka", "Netflix", "Przelew od Jan Kowalski")
- "date": data w formacie YYYY-MM-DD. WAŻNE: Jeśli na zdjęciu nie widać roku, użyj roku ${currentYear}.

Dopasuj kategorię najlepiej jak potrafisz na podstawie opisu transakcji.
${
  type === "expense"
    ? `Wskazówki kategorii:
- ZAKUPY = sklepy spożywcze (Biedronka, Lidl, Żabka, itp.)
- RESTAURACJE = restauracje, fast-food, dostawy jedzenia
- TRANSPORT = paliwo, bilety komunikacji, Uber, Bolt
- SUBSCRIPTIONS = Netflix, Spotify, abonamenty, subskrypcje
- MIESZKANIE = czynsz, prąd, gaz, internet, opłaty mieszkaniowe
- FUN = kino, gry, rozrywka, imprezy
- OTHER = wszystko inne`
    : `Wskazówki kategorii:
- WYPLATA_1 = główna wypłata, pensja
- WYPLATA_2 = dodatkowa wypłata, druga pensja
- INNE = inne przychody, zwroty, przelewy`
}

WAŻNE: 
- Zwróć TYLKO poprawny JSON (tablica obiektów), bez żadnego innego tekstu
- Jeśli nie widzisz transakcji, zwróć pustą tablicę []
- Ignoruj salda, tylko wykrywaj transakcje
- Kwoty zawsze jako LICZBY DODATNIE (bez znaku minus!)
- Daty: jeśli brak roku na zdjęciu, użyj ${currentYear}

Przykład odpowiedzi:
[{"amount": 125.50, "category": "${categories[0]}", "description": "Biedronka", "date": "${currentYear}-02-15"}]`;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Brak klucza API Gemini. Dodaj GEMINI_API_KEY do zmiennych środowiskowych." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const type = (formData.get("type") as string) || "expense";

    if (!image) {
      return NextResponse.json(
        { error: "Brak obrazu" },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type || "image/png";

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: buildPrompt(type as "income" | "expense") },
              {
                inlineData: {
                  mimeType,
                  data: base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Gemini API error:", errorData);
      
      let errorMessage = "Błąd API Gemini.";
      try {
        const parsed = JSON.parse(errorData);
        if (parsed.error && parsed.error.message) {
          errorMessage = `Błąd: ${parsed.error.message}`;
        }
      } catch {
        // ignore
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 502 }
      );
    }

    const data = await response.json();
    const textContent =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Extract JSON from response (Gemini sometimes wraps in markdown)
    const jsonMatch = textContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ transactions: [] });
    }

    const transactions = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas skanowania" },
      { status: 500 }
    );
  }
}
