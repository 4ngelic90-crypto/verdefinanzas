import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/finance";
import { cn } from "@/lib/utils";
import type { Summary } from "@/types/finance";
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from "lucide-react";

interface BalanceCardProps {
  summary: Summary | null;
  isLoading: boolean;
}

/** Hero card: available balance (income − expense) plus period totals. */
export function BalanceCard({ summary, isLoading }: BalanceCardProps) {
  const balance = summary?.balance ?? 0n;
  const income = summary?.totalIncome ?? 0n;
  const expense = summary?.totalExpense ?? 0n;

  return (
    <Card
      data-ocid="balance.card"
      className="balance-glow relative gap-0 overflow-hidden rounded-2xl border-border bg-card p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Saldo disponible
          </p>
          <p
            data-ocid="balance.value"
            className={cn(
              "tabular mt-2 font-display text-4xl font-bold tracking-tight",
              balance < 0n ? "text-expense" : "text-primary",
            )}
          >
            {isLoading ? "—" : formatCurrency(balance)}
          </p>
        </div>
        <BalanceRing income={income} expense={expense} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricRow
          label="Ingresos"
          value={formatCurrency(income)}
          tone="income"
          icon={<ArrowUpRight className="size-4" aria-hidden="true" />}
        />
        <MetricRow
          label="Gastos"
          value={formatCurrency(expense)}
          tone="expense"
          icon={<ArrowDownLeft className="size-4" aria-hidden="true" />}
        />
      </div>
    </Card>
  );
}

function BalanceRing({ income, expense }: { income: bigint; expense: bigint }) {
  const total = income + expense;
  const ratio = total > 0n ? Number(income) / Number(total) : 0;
  const circumference = 2 * Math.PI * 26;
  const dash = circumference * ratio;

  return (
    <div className="relative size-16 shrink-0" aria-hidden="true">
      <svg
        viewBox="0 0 64 64"
        role="presentation"
        className="size-16 -rotate-90"
      >
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          strokeWidth="6"
          className="stroke-secondary"
        />
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className="stroke-primary transition-[stroke-dasharray] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        <TrendingUp className="size-5 text-primary" />
      </span>
    </div>
  );
}

function MetricRow({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "income" | "expense";
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-secondary/60 px-3 py-2.5">
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-lg",
          tone === "income"
            ? "bg-income/15 text-income"
            : "bg-expense/15 text-expense",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="tabular truncate text-sm font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}
