export function normalizeTransactionDescription(value: string | null | undefined): string {
  return sanitizeTransactionDescription(value).toLowerCase();
}

export function sanitizeTransactionDescription(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

export function buildTransactionSignature(params: {
  amount: number;
  category: string;
  description: string | null | undefined;
  date: Date;
}): string {
  return [
    params.amount.toFixed(2),
    params.category,
    normalizeTransactionDescription(params.description),
    params.date.toISOString(),
  ].join("|");
}

export function getDateWindow(dates: Date[]): { min: Date; max: Date } | null {
  if (dates.length === 0) return null;
  const timestamps = dates.map((d) => d.getTime());
  const minTs = Math.min(...timestamps);
  const maxTs = Math.max(...timestamps);
  return {
    min: new Date(minTs),
    max: new Date(maxTs),
  };
}
