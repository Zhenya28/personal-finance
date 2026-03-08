export interface MBankTransaction {
  dateAccounting: string;
  dateOperation: string;
  description: string;
  title: string;
  counterparty: string;
  accountNumber: string;
  amount: number;
  balanceAfter: number;
  type: "income" | "expense";
}

/**
 * Parse mBank CSV export.
 * mBank format: semicolon-separated, Polish headers, comma decimals.
 * Header row starts with #Data księgowania or #Data ksiegowania
 * Lines might have BOM and use Windows line endings.
 */
export function parseMBankCSV(content: string): MBankTransaction[] {
  const clean = content
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const lines = clean.split("\n").filter((l) => l.trim());

  const headerInfo = findHeaderLine(lines);
  if (!headerInfo) {
    throw new Error(
      "Nie znaleziono naglowka mBank CSV. Upewnij sie ze plik jest eksportem z mBank."
    );
  }

  const { headerIndex, delimiter } = headerInfo;
  const headers = splitCsvLine(lines[headerIndex], delimiter).map(normalizeHeader);

  const dateAccIdx = findColumnIndex(headers, [
    "data ksiegowania",
    "data ksieg",
    "booking date",
  ]);
  const dateOpIdx = findColumnIndex(headers, [
    "data operacji",
    "data transakcji",
    "data realizacji",
    "transaction date",
  ]);
  const descIdx = findColumnIndex(headers, [
    "opis operacji",
    "opis",
    "szczegoly",
    "description",
    "detale",
  ]);
  const titleIdx = findColumnIndex(headers, [
    "tytul operacji",
    "tytul",
    "title",
  ]);
  const counterpartyIdx = findColumnIndex(headers, [
    "nadawca odbiorca",
    "nadawca",
    "odbiorca",
    "kontrahent",
    "counterparty",
    "nazwa odbiorcy",
    "nazwa nadawcy",
  ]);
  const accountIdx = findColumnIndex(headers, [
    "numer konta",
    "nr rachunku",
    "rachunek",
    "account number",
    "iban",
  ]);
  let amountIdx = findColumnIndex(headers, [
    "kwota",
    "kwota transakcji",
    "kwota operacji",
    "amount",
  ]);
  const creditIdx = findColumnIndex(headers, [
    "kwota uznania",
    "uznanie",
    "credit",
  ]);
  const debitIdx = findColumnIndex(headers, [
    "kwota obciazenia",
    "obciazenie",
    "debit",
  ]);
  if (
    amountIdx !== -1 &&
    (headers[amountIdx].includes("uznania") ||
      headers[amountIdx].includes("obciazenia"))
  ) {
    amountIdx = -1;
  }
  const balanceIdx = findColumnIndex(headers, [
    "saldo po operacji",
    "saldo",
    "balance",
  ]);

  const transactions: MBankTransaction[] = [];

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith("#")) continue;

    const cols = splitCsvLine(line, delimiter).map((c) => c.trim());

    const amount = parseAmount(cols, amountIdx, creditIdx, debitIdx);
    if (amount === null) continue;

    const dateStr =
      getCol(cols, dateAccIdx) ||
      getCol(cols, dateOpIdx) ||
      cols.find((c) => Boolean(normalizeMBankDate(c))) ||
      "";
    if (!dateStr) continue;

    const dateAccounting = normalizeMBankDate(getCol(cols, dateAccIdx) || dateStr);
    const dateOperation = normalizeMBankDate(getCol(cols, dateOpIdx) || dateStr);
    if (!dateAccounting && !dateOperation) continue;

    transactions.push({
      dateAccounting: dateAccounting || dateOperation,
      dateOperation: dateOperation || dateAccounting,
      description: getCol(cols, descIdx),
      title: getCol(cols, titleIdx),
      counterparty: getCol(cols, counterpartyIdx),
      accountNumber: getCol(cols, accountIdx),
      amount: Math.abs(amount),
      balanceAfter: parseNumber(getCol(cols, balanceIdx) || "0"),
      type: amount >= 0 ? "income" : "expense",
    });
  }

  if (transactions.length === 0) {
    throw new Error(
      "Rozpoznano naglowek CSV, ale nie znaleziono wierszy transakcji. Sprawdz czy to pelna historia operacji z mBank."
    );
  }

  return transactions;
}

/**
 * Normalize mBank date strings to ISO YYYY-MM-DD format.
 * Handles: DD.MM.YYYY, DD-MM-YYYY, YYYY-MM-DD (passthrough)
 */
function normalizeMBankDate(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const dotMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) return `${dotMatch[3]}-${dotMatch[2]}-${dotMatch[1]}`;
  const slashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) return `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`;
  const dashMatch = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dashMatch) return `${dashMatch[3]}-${dashMatch[2]}-${dashMatch[1]}`;
  const isoWithTime = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})[T ]/);
  if (isoWithTime) return `${isoWithTime[1]}-${isoWithTime[2]}-${isoWithTime[3]}`;
  return "";
}

function findColumnIndex(headers: string[], candidates: string[]): number {
  for (const candidate of candidates) {
    const idx = headers.findIndex((h) => h.includes(candidate));
    if (idx !== -1) return idx;
  }
  return -1;
}

/**
 * Build a searchable description from mBank transaction fields
 */
export function buildSearchableDescription(tx: MBankTransaction): string {
  return [tx.title, tx.counterparty, tx.description]
    .filter(Boolean)
    .join(" | ")
    .trim() || "Import mBank";
}

function getCol(cols: string[], idx: number): string {
  if (idx < 0 || idx >= cols.length) return "";
  return cols[idx]?.trim() ?? "";
}

function parseAmount(
  cols: string[],
  amountIdx: number,
  creditIdx: number,
  debitIdx: number
): number | null {
  if (amountIdx !== -1) {
    const amountRaw = getCol(cols, amountIdx);
    const amount = parseNumber(amountRaw);
    if (!Number.isNaN(amount)) return amount;
  }

  const credit = creditIdx !== -1 ? parseNumber(getCol(cols, creditIdx)) : NaN;
  const debit = debitIdx !== -1 ? parseNumber(getCol(cols, debitIdx)) : NaN;

  if (!Number.isNaN(credit) && Number.isNaN(debit)) return credit;
  if (Number.isNaN(credit) && !Number.isNaN(debit)) return -Math.abs(debit);
  if (!Number.isNaN(credit) && !Number.isNaN(debit)) return credit - debit;
  return null;
}

function parseNumber(raw: string): number {
  let v = (raw || "").trim();
  if (!v) return NaN;

  v = v
    .replace(/"/g, "")
    .replace(/\s|\u00a0/g, "")
    .replace(/[A-Za-z]{3}$/g, "")
    .replace(/[^\d,.\-()]/g, "");

  if (!v) return NaN;

  const trailingMinus = /-$/.test(v);
  v = v.replace(/-$/, "");

  const inParentheses = /^\(.*\)$/.test(v);
  v = v.replace(/[()]/g, "");

  if (v.includes(",") && v.includes(".")) {
    if (v.lastIndexOf(",") > v.lastIndexOf(".")) {
      v = v.replace(/\./g, "").replace(",", ".");
    } else {
      v = v.replace(/,/g, "");
    }
  } else if (v.includes(",")) {
    v = v.replace(",", ".");
  }

  const parsed = parseFloat(v);
  if (Number.isNaN(parsed)) return NaN;

  return trailingMinus || inParentheses ? -Math.abs(parsed) : parsed;
}

function normalizeHeader(raw: string): string {
  return normalizePolishChars(raw)
    .replace(/^#/, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizePolishChars(value: string): string {
  return value
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .replace(/ą/g, "a")
    .replace(/Ą/g, "A")
    .replace(/ć/g, "c")
    .replace(/Ć/g, "C")
    .replace(/ę/g, "e")
    .replace(/Ę/g, "E")
    .replace(/ń/g, "n")
    .replace(/Ń/g, "N")
    .replace(/ó/g, "o")
    .replace(/Ó/g, "O")
    .replace(/ś/g, "s")
    .replace(/Ś/g, "S")
    .replace(/ż|ź/g, "z")
    .replace(/Ż|Ź/g, "Z");
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let curr = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        curr += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }

    if (ch === delimiter && !inQuotes) {
      out.push(curr);
      curr = "";
      continue;
    }

    curr += ch;
  }
  out.push(curr);

  return out.map((c) => c.trim());
}

function findHeaderLine(
  lines: string[]
): { headerIndex: number; delimiter: string } | null {
  const delimiters = [";", "\t", ","];
  let best: { headerIndex: number; delimiter: string; score: number } | null = null;

  for (let i = 0; i < lines.length; i++) {
    for (const delimiter of delimiters) {
      const cols = splitCsvLine(lines[i], delimiter).map(normalizeHeader);
      if (cols.length < 3) continue;

      const hasDate = cols.some((h) => h.includes("data"));
      const hasAmount = cols.some(
        (h) =>
          h.includes("kwota") ||
          h.includes("amount") ||
          h.includes("uznania") ||
          h.includes("obciazenia")
      );
      const hasText = cols.some(
        (h) =>
          h.includes("opis") ||
          h.includes("tytul") ||
          h.includes("nadawca") ||
          h.includes("odbiorca") ||
          h.includes("kontrahent")
      );

      const firstLooksLikeDate = Boolean(normalizeMBankDate(cols[0]));
      if (firstLooksLikeDate) continue;

      const score = Number(hasDate) + Number(hasAmount) + Number(hasText);
      if (score < 2) continue;

      if (!best || score > best.score) {
        best = { headerIndex: i, delimiter, score };
      }
    }
  }

  if (!best) return null;
  return { headerIndex: best.headerIndex, delimiter: best.delimiter };
}
