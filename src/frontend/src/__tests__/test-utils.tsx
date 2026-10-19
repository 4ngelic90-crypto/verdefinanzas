import type {
  CategoryTotal,
  Period,
  Summary,
  Transaction,
  TransactionInput,
  TxType,
} from "@/backend";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

/**
 * The subset of the generated backend interface the app's hooks consume.
 * A local typed mock keeps the frontend suite independent of the network and
 * of the real canister, while still type-checking against the app's own types.
 */
export interface MockBackend {
  getSummary(period: Period): Promise<Summary>;
  listTransactions(
    period: Period,
    txType: TxType | null,
  ): Promise<Transaction[]>;
  getCategoryTotals(period: Period): Promise<CategoryTotal[]>;
  addTransaction(
    input: TransactionInput,
  ): Promise<{ __kind__: "ok"; ok: Transaction }>;
  updateTransaction(
    id: bigint,
    input: TransactionInput,
  ): Promise<{ __kind__: "ok"; ok: Transaction }>;
  deleteTransaction(id: bigint): Promise<{ __kind__: "ok"; ok: null }>;
}

export interface MockBackendState {
  summary: Summary;
  transactions: Transaction[];
  categoryTotals: CategoryTotal[];
  /** Every input passed to addTransaction, in call order. */
  added: TransactionInput[];
  /** Every id passed to deleteTransaction, in call order. */
  deleted: bigint[];
}

export function emptySummary(): Summary {
  return {
    balance: 0n,
    totalIncome: 0n,
    totalExpense: 0n,
    transactionCount: 0n,
  };
}

/**
 * Builds a stateful in-memory backend mock. Mutations update the state so a
 * re-render after invalidation observes the new values, mirroring the real
 * canister's read-after-write behavior.
 */
export function createMockBackend(initial?: Partial<MockBackendState>): {
  backend: MockBackend;
  state: MockBackendState;
} {
  const state: MockBackendState = {
    summary: initial?.summary ?? emptySummary(),
    transactions: initial?.transactions ?? [],
    categoryTotals: initial?.categoryTotals ?? [],
    added: [],
    deleted: [],
  };

  const backend: MockBackend = {
    async getSummary() {
      return state.summary;
    },
    async listTransactions() {
      return state.transactions;
    },
    async getCategoryTotals() {
      return state.categoryTotals;
    },
    async addTransaction(input) {
      state.added.push(input);
      const tx: Transaction = {
        id: BigInt(state.transactions.length + 1),
        date: input.date,
        note: input.note,
        category: input.category,
        txType: input.txType,
        amount: input.amount,
      };
      state.transactions = [tx, ...state.transactions];
      return { __kind__: "ok", ok: tx };
    },
    async updateTransaction(id, input) {
      const tx: Transaction = {
        id,
        date: input.date,
        note: input.note,
        category: input.category,
        txType: input.txType,
        amount: input.amount,
      };
      state.transactions = state.transactions.map((t) =>
        t.id === id ? tx : t,
      );
      return { __kind__: "ok", ok: tx };
    },
    async deleteTransaction(id) {
      state.deleted.push(id);
      state.transactions = state.transactions.filter((t) => t.id !== id);
      return { __kind__: "ok", ok: null };
    },
  };

  return { backend, state };
}

/** A fresh QueryClient with retries disabled so failures surface immediately. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

export function TestProviders({
  client,
  children,
}: {
  client: QueryClient;
  children: ReactNode;
}) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
