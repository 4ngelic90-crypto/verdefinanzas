import { Category, Period, TxType } from "@/backend";

export { Category, Period, TxType };

export type TransactionId = bigint;

export interface Transaction {
  id: TransactionId;
  date: bigint;
  note?: string;
  category: Category;
  txType: TxType;
  amount: bigint;
}

export interface TransactionInput {
  date: bigint;
  note?: string;
  category: Category;
  txType: TxType;
  amount: bigint;
}

export interface Summary {
  balance: bigint;
  totalIncome: bigint;
  totalExpense: bigint;
  transactionCount: bigint;
}

export interface CategoryTotal {
  total: bigint;
  category: Category;
  isTop: boolean;
  percentage: bigint;
}

export interface CategoryMeta {
  value: Category;
  label: string;
  /** Tailwind text color class for the icon badge. */
  accent: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  [Category.food]: {
    value: Category.food,
    label: "Comida",
    accent: "text-chart-1",
  },
  [Category.transport]: {
    value: Category.transport,
    label: "Transporte",
    accent: "text-chart-2",
  },
  [Category.entertainment]: {
    value: Category.entertainment,
    label: "Entretenimiento",
    accent: "text-chart-3",
  },
  [Category.home]: {
    value: Category.home,
    label: "Hogar",
    accent: "text-chart-4",
  },
  [Category.health]: {
    value: Category.health,
    label: "Salud",
    accent: "text-chart-5",
  },
  [Category.other]: {
    value: Category.other,
    label: "Otros",
    accent: "text-muted-foreground",
  },
};

export const CATEGORY_ORDER: Category[] = [
  Category.food,
  Category.transport,
  Category.entertainment,
  Category.home,
  Category.health,
  Category.other,
];

export const PERIOD_LABELS: Record<Period, string> = {
  [Period.currentMonth]: "Mes actual",
  [Period.previousMonth]: "Mes anterior",
  [Period.all]: "Todo",
};

export const TX_TYPE_LABELS: Record<TxType, string> = {
  [TxType.income]: "Ingreso",
  [TxType.expense]: "Gasto",
};
