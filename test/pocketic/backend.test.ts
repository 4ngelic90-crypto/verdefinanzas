import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

/** Nanosecond timestamp for a fixed date, so period filters are deterministic. */
function timestampFor(year: number, monthIndex: number, day: number): bigint {
  return BigInt(new Date(year, monthIndex, day, 12, 0, 0).getTime()) * 1_000_000n;
}

/**
 * Each test runs as its own caller so the shared canister's per-caller store
 * starts empty, making every assertion independent of test order.
 */
function useCaller(seed: string): void {
  actor.setIdentity(createIdentity(seed));
}

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("responde a las lecturas de estado vacío sin trap", async () => {
  useCaller("empty-state");
  await expect(actor.listTransactions({ all: null }, [])).resolves.toEqual([]);
  await expect(actor.getSummary({ all: null })).resolves.toMatchObject({
    balance: 0n,
    totalIncome: 0n,
    totalExpense: 0n,
    transactionCount: 0n,
  });
  // The category breakdown always lists every predefined category, all at zero.
  const totals = await actor.getCategoryTotals({ all: null });
  expect(totals).toHaveLength(6);
  expect(totals.every((t) => t.total === 0n && !t.isTop)).toBe(true);
});

it("registra un movimiento y lo devuelve en la lista", async () => {
  useCaller("round-trip");
  const date = timestampFor(2026, 9, 15);
  const result = await actor.addTransaction({
    txType: { expense: null },
    amount: 5000n,
    category: { food: null },
    date,
    note: ["Almuerzo"],
  });
  expect("ok" in result).toBe(true);

  const listed = await actor.listTransactions({ all: null }, []);
  expect(listed).toHaveLength(1);
  expect(listed[0]).toMatchObject({
    amount: 5000n,
    category: { food: null },
    txType: { expense: null },
    note: ["Almuerzo"],
  });
});

it("calcula el saldo como ingresos menos gastos", async () => {
  useCaller("balance");
  const date = timestampFor(2026, 9, 15);
  await actor.addTransaction({
    txType: { expense: null },
    amount: 5000n,
    category: { food: null },
    date,
    note: [],
  });
  await actor.addTransaction({
    txType: { income: null },
    amount: 20000n,
    category: { other: null },
    date,
    note: [],
  });

  const summary = await actor.getSummary({ all: null });
  expect(summary.balance).toBe(15000n);
  expect(summary.totalIncome).toBe(20000n);
  expect(summary.totalExpense).toBe(5000n);
});

it("resalta la categoría con mayor gasto acumulado", async () => {
  useCaller("top-category");
  const date = timestampFor(2026, 9, 15);
  await actor.addTransaction({
    txType: { expense: null },
    amount: 5000n,
    category: { food: null },
    date,
    note: [],
  });
  await actor.addTransaction({
    txType: { expense: null },
    amount: 2000n,
    category: { transport: null },
    date,
    note: [],
  });

  const totals = await actor.getCategoryTotals({ all: null });
  const food = totals.find((t) => "food" in t.category);
  const transport = totals.find((t) => "transport" in t.category);
  expect(food?.isTop).toBe(true);
  expect(transport?.isTop).toBe(false);
  expect(food?.total).toBe(5000n);
});

it("actualiza y elimina un movimiento existente", async () => {
  useCaller("update-delete");
  const date = timestampFor(2026, 9, 15);
  const created = await actor.addTransaction({
    txType: { expense: null },
    amount: 1000n,
    category: { home: null },
    date,
    note: [],
  });
  if (!("ok" in created)) throw new Error("addTransaction failed");
  const id = created.ok.id;

  const updated = await actor.updateTransaction(id, {
    txType: { expense: null },
    amount: 3000n,
    category: { health: null },
    date,
    note: ["Actualizado"],
  });
  expect("ok" in updated).toBe(true);

  const afterUpdate = await actor.listTransactions({ all: null }, []);
  const found = afterUpdate.find((t) => t.id === id);
  expect(found).toMatchObject({ amount: 3000n, category: { health: null } });

  const deleted = await actor.deleteTransaction(id);
  expect("ok" in deleted).toBe(true);
  const afterDelete = await actor.listTransactions({ all: null }, []);
  expect(afterDelete.find((t) => t.id === id)).toBeUndefined();
});

it("rechaza un monto cero con invalidAmount", async () => {
  useCaller("invalid-amount");
  const result = await actor.addTransaction({
    txType: { expense: null },
    amount: 0n,
    category: { food: null },
    date: timestampFor(2026, 9, 15),
    note: [],
  });
  expect(result).toEqual({ err: { invalidAmount: null } });
});

it("aísla los movimientos por llamante", async () => {
  const alice = createIdentity("isolation-alice");
  const bob = createIdentity("isolation-bob");

  actor.setIdentity(alice);
  await actor.addTransaction({
    txType: { expense: null },
    amount: 700n,
    category: { food: null },
    date: timestampFor(2026, 9, 15),
    note: [],
  });

  actor.setIdentity(bob);
  await expect(actor.listTransactions({ all: null }, [])).resolves.toEqual([]);
});
