import { Period } from "@/backend";
import { cn } from "@/lib/utils";
import { PERIOD_LABELS } from "@/types/finance";

const PERIODS: Period[] = [
  Period.currentMonth,
  Period.previousMonth,
  Period.all,
];

interface PeriodFilterProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  className?: string;
}

/** Segmented control for the visible period (current month / previous / all). */
export function PeriodFilter({
  period,
  onPeriodChange,
  className,
}: PeriodFilterProps) {
  return (
    <div
      role="tablist"
      aria-label="Período"
      data-ocid="period.filter"
      className={cn("flex gap-1 rounded-xl bg-secondary/60 p-1", className)}
    >
      {PERIODS.map((option) => {
        const isActive = option === period;
        return (
          <button
            key={option}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-ocid={`period.${option}.tab`}
            onClick={() => onPeriodChange(option)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              isActive
                ? "bg-card text-foreground shadow-subtle"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {PERIOD_LABELS[option]}
          </button>
        );
      })}
    </div>
  );
}
