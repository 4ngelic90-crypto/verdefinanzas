import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { CATEGORY_META, type CategoryTotal } from "@/types/finance";
import { BarChart3 } from "lucide-react";
import { useMemo } from "react";

interface CategoryChartProps {
  totals: CategoryTotal[];
  topCategory: CategoryTotal | null;
  isLoading?: boolean;
  /** Compact variant trims the footer note for the home summary. */
  compact?: boolean;
}

/**
 * Horizontal bar chart of accumulated spend per category. The category with
 * the highest spend is highlighted in the accent green; the rest use the
 * muted chart ramp. Each row shows its share of the period total.
 */
export function CategoryChart({
  totals,
  topCategory,
  isLoading = false,
  compact = false,
}: CategoryChartProps) {
  const sorted = useMemo(
    () => [...totals].sort((a, b) => Number(b.total - a.total)),
    [totals],
  );

  return (
    <Card
      data-ocid="category.chart"
      className="gap-0 rounded-2xl border-border bg-card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-sm font-semibold text-foreground">
          Gasto por categoría
        </h2>
        {topCategory && (
          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary">
            {CATEGORY_META[topCategory.category].label} lidera
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }, (_, i) => `chart-skeleton-${i}`).map(
            (id) => (
              <div
                key={id}
                className="h-8 animate-pulse rounded-lg bg-secondary/60"
              />
            ),
          )}
        </div>
      ) : sorted.length === 0 ? (
        <div
          data-ocid="category.empty_state"
          className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center"
        >
          <BarChart3
            className="size-6 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-foreground">
            Aún no hay gastos registrados
          </p>
          <p className="max-w-[16rem] text-xs text-muted-foreground">
            Cuando registres un gasto verás aquí el desglose por categoría.
          </p>
        </div>
      ) : (
        <ul data-ocid="category.list" className="mt-4 space-y-3.5">
          {sorted.map((item) => {
            const meta = CATEGORY_META[item.category];
            const pct = Number(item.percentage);
            const width = Math.min(Math.max(pct, 2), 100);
            return (
              <li
                key={item.category}
                data-ocid={`category.item.${item.category}`}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="flex min-w-0 items-center gap-2 font-medium text-foreground">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        item.isTop ? "bg-primary" : "bg-muted-foreground/50",
                      )}
                      aria-hidden="true"
                    />
                    <span className="truncate">{meta.label}</span>
                  </span>
                  <span className="tabular shrink-0 text-muted-foreground">
                    {formatCurrency(item.total)}
                    <span
                      className={cn(
                        "ml-2 font-semibold",
                        item.isTop ? "text-primary" : "text-foreground",
                      )}
                    >
                      {pct}%
                    </span>
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      "h-full rounded-full transition-[width] duration-700 ease-out",
                      item.isTop ? "bg-primary" : "bg-chart-3",
                    )}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {compact && sorted.length > 0 && (
        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Desglose del período seleccionado
        </p>
      )}
    </Card>
  );
}
