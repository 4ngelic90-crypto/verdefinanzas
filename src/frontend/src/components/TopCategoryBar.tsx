import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { CATEGORY_META, type CategoryTotal } from "@/types/finance";
import { Flame } from "lucide-react";

interface TopCategoryBarProps {
  topCategory: CategoryTotal | null;
  /** Total expense across all categories for the period, in cents. */
  totalExpense: bigint;
  isLoading?: boolean;
}

/**
 * Highlights the category with the highest accumulated spend using a
 * prominent progress bar that fills to its share of the period total.
 */
export function TopCategoryBar({
  topCategory,
  totalExpense,
  isLoading = false,
}: TopCategoryBarProps) {
  if (isLoading) {
    return (
      <Card
        data-ocid="top_category.loading_state"
        className="gap-0 rounded-2xl border-border bg-card p-5"
      >
        <div className="h-3 w-32 animate-pulse rounded-full bg-secondary/60" />
        <div className="mt-3 h-7 w-40 animate-pulse rounded-lg bg-secondary/60" />
        <div className="mt-4 h-3 w-full animate-pulse rounded-full bg-secondary/60" />
      </Card>
    );
  }

  if (!topCategory) {
    return (
      <Card
        data-ocid="top_category.empty_state"
        className="gap-0 rounded-2xl border-dashed border-border bg-card/50 p-5"
      >
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Categoría con mayor gasto
        </p>
        <p className="mt-2 text-sm font-medium text-foreground">
          Aún no hay gastos en este período
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Registra un gasto para descubrir qué categoría lidera.
        </p>
      </Card>
    );
  }

  const meta = CATEGORY_META[topCategory.category];
  const pct = Number(topCategory.percentage);
  const width = Math.min(Math.max(pct, 2), 100);

  return (
    <Card
      data-ocid="top_category.card"
      className="balance-glow gap-0 rounded-2xl border-border bg-card p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Categoría con mayor gasto
        </p>
        <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
          <Flame className="size-3" aria-hidden="true" />
          Lidera
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <p
          data-ocid="top_category.label"
          className="font-display text-2xl font-bold tracking-tight text-foreground"
        >
          {meta.label}
        </p>
        <p
          data-ocid="top_category.value"
          className="tabular text-lg font-semibold text-primary"
        >
          {formatCurrency(topCategory.total)}
        </p>
      </div>

      <div
        role="progressbar"
        aria-label={`${meta.label}: ${pct}% del gasto total`}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        data-ocid="top_category.progress"
        className="mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary"
      >
        <div
          className={cn(
            "h-full rounded-full bg-primary transition-[width] duration-700 ease-out",
          )}
          style={{ width: `${width}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          <span
            data-ocid="top_category.percentage"
            className="tabular font-semibold text-foreground"
          >
            {pct}%
          </span>{" "}
          del gasto total
        </span>
        <span className="tabular text-muted-foreground">
          {formatCurrency(totalExpense)}
        </span>
      </div>
    </Card>
  );
}
