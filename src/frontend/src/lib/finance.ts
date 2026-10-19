import { type Category, TxType } from "@/backend";
import { CATEGORY_META } from "@/types/finance";

const currencyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Motoko Time.now() is a nanosecond bigint; convert before any Date use. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCurrency(amount: bigint): string {
  return currencyFormatter.format(Number(amount) / 100);
}

export function formatSignedCurrency(amount: bigint, txType: TxType): string {
  const sign = txType === TxType.income ? "+" : "−";
  return `${sign}${formatCurrency(amount)}`;
}

export function formatDate(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Fecha desconocida";
  return dateFormatter.format(date);
}

export function categoryLabel(category: Category): string {
  return CATEGORY_META[category]?.label ?? "Otros";
}

/** Converts a yyyy-mm-dd input value into a nanosecond bigint timestamp. */
export function dateInputToTimestamp(value: string): bigint {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1, 12, 0, 0);
  return BigInt(date.getTime()) * 1_000_000n;
}

export function timestampToDateInput(timestamp: bigint): string {
  const date = timestampToDate(timestamp) ?? new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayDateInput(): string {
  return timestampToDateInput(BigInt(Date.now()) * 1_000_000n);
}

/** Parses a user-entered amount string into integer cents. Returns null if invalid. */
export function parseAmountToCents(value: string): bigint | null {
  const normalized = value.replace(",", ".").trim();
  if (normalized === "") return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return BigInt(Math.round(parsed * 100));
}
