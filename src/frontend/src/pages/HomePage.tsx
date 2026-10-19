import { BalanceCard } from "@/components/BalanceCard";
import { CategoryChart } from "@/components/CategoryChart";
import { PeriodFilter } from "@/components/PeriodFilter";
import { TransactionList } from "@/components/TransactionList";
import { Button } from "@/components/ui/button";
import type {
  CategoryTotal,
  Period,
  Summary,
  Transaction,
} from "@/types/finance";
import { Plus } from "lucide-react";
import { useMemo } from "react";

interface HomePageProps {
  summary: Summary | null;
  transactions: Transaction[];
  categoryTotals: CategoryTotal[];
  period: Period;
  onPeriodChange: (period: Period) => void;
  onAdd: () => void;
  onEdit: (tx: Transaction) => void;
  onSeeAll: () => void;
  isLoading: boolean;
}

/** Home view: balance hero, quick add, category chart and recent movements. */
export function HomePage({
  summary,
  transactions,
  categoryTotals,
  period,
  onPeriodChange,
  onAdd,
  onEdit,
  onSeeAll,
  isLoading,
}: HomePageProps) {
  const recent = transactions.slice(0, 4);
  const topCategory = useMemo(
    () => categoryTotals.find((c) => c.isTop) ?? null,
    [categoryTotals],
  );

  return (
    <div data-ocid="home.page" className="space-y-5">
      <PeriodFilter period={period} onPeriodChange={onPeriodChange} />

      <BalanceCard summary={summary} isLoading={isLoading} />

      <Button
        type="button"
        data-ocid="transaction.add_button"
        onClick={onAdd}
        className="h-12 w-full rounded-xl text-sm font-semibold"
      >
        <Plus className="size-4" aria-hidden="true" />
        Registrar movimiento
      </Button>

      <CategoryChart
        totals={categoryTotals}
        topCategory={topCategory}
        compact
        isLoading={isLoading}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold text-foreground">
            Movimientos recientes
          </h2>
          <button
            type="button"
            data-ocid="home.see_all_button"
            onClick={onSeeAll}
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            Ver todos
          </button>
        </div>

        <TransactionList
          transactions={recent}
          onEdit={onEdit}
          onAdd={onAdd}
          ocidPrefix="home.recent"
        />
      </section>
    </div>
  );
}
