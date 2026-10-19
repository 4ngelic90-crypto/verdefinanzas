import { CategoryChart } from "@/components/CategoryChart";
import { PeriodFilter } from "@/components/PeriodFilter";
import { TopCategoryBar } from "@/components/TopCategoryBar";
import { formatCurrency } from "@/lib/finance";
import type { CategoryTotal, Period } from "@/types/finance";
import { useMemo } from "react";

interface StatsPageProps {
  categoryTotals: CategoryTotal[];
  period: Period;
  onPeriodChange: (period: Period) => void;
  isLoading: boolean;
}

/**
 * Statistics view: highlights the top-spend category with a progress bar and
 * breaks down accumulated spend per category in a horizontal bar chart.
 */
export function StatsPage({
  categoryTotals,
  period,
  onPeriodChange,
  isLoading,
}: StatsPageProps) {
  const topCategory = useMemo(
    () => categoryTotals.find((c) => c.isTop) ?? null,
    [categoryTotals],
  );

  const totalExpense = useMemo(
    () => categoryTotals.reduce((acc, c) => acc + c.total, 0n),
    [categoryTotals],
  );

  return (
    <div data-ocid="stats.page" className="space-y-5">
      <h2 className="font-display text-lg font-semibold text-foreground">
        Estadísticas
      </h2>

      <PeriodFilter period={period} onPeriodChange={onPeriodChange} />

      <TopCategoryBar
        topCategory={topCategory}
        totalExpense={totalExpense}
        isLoading={isLoading}
      />

      <CategoryChart
        totals={categoryTotals}
        topCategory={topCategory}
        isLoading={isLoading}
      />

      {!isLoading && categoryTotals.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Gasto total del período:{" "}
          <span className="tabular font-medium text-foreground">
            {formatCurrency(totalExpense)}
          </span>
        </p>
      )}
    </div>
  );
}
