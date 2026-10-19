import { Category, TxType } from "@/backend";
import {
  categoryLabel,
  dateInputToTimestamp,
  formatCurrency,
  formatSignedCurrency,
  parseAmountToCents,
  timestampToDateInput,
} from "@/lib/finance";
import { describe, expect, it } from "vitest";

describe("parseAmountToCents", () => {
  it("convierte un monto decimal a céntimos enteros", () => {
    expect(parseAmountToCents("50")).toBe(5000n);
    expect(parseAmountToCents("12,34")).toBe(1234n);
    expect(parseAmountToCents("12.34")).toBe(1234n);
  });

  it("rechaza montos no positivos o vacíos", () => {
    expect(parseAmountToCents("0")).toBeNull();
    expect(parseAmountToCents("-5")).toBeNull();
    expect(parseAmountToCents("")).toBeNull();
    expect(parseAmountToCents("abc")).toBeNull();
  });
});

describe("formatCurrency", () => {
  it("formatea céntimos como euros", () => {
    expect(formatCurrency(15000n)).toContain("150,00");
    expect(formatCurrency(5000n)).toContain("50,00");
  });
});

describe("formatSignedCurrency", () => {
  it("antepone el signo según el tipo de movimiento", () => {
    expect(formatSignedCurrency(5000n, TxType.expense)).toMatch(/^−/);
    expect(formatSignedCurrency(20000n, TxType.income)).toMatch(/^\+/);
  });
});

describe("categoryLabel", () => {
  it("traduce cada categoría predefinida", () => {
    expect(categoryLabel(Category.food)).toBe("Comida");
    expect(categoryLabel(Category.transport)).toBe("Transporte");
    expect(categoryLabel(Category.entertainment)).toBe("Entretenimiento");
    expect(categoryLabel(Category.home)).toBe("Hogar");
    expect(categoryLabel(Category.health)).toBe("Salud");
    expect(categoryLabel(Category.other)).toBe("Otros");
  });
});

describe("dateInputToTimestamp / timestampToDateInput", () => {
  it("hace round-trip de una fecha de entrada", () => {
    const timestamp = dateInputToTimestamp("2026-10-15");
    expect(timestampToDateInput(timestamp)).toBe("2026-10-15");
  });
});
