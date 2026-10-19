import { type Period, TxType } from "@/backend";
import { PeriodFilter } from "@/components/PeriodFilter";
import { TransactionRow } from "@/components/TransactionRow";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types/finance";
import { Plus, Wallet } from "lucide-react";

interface TransactionsPageProps {
  transactions: Transaction[];
  period: Period;
  onPeriodChange: (period: Period) => void;
  typeFilter: TxType | "all";
  onTypeFilterChange: (value: TxType | "all") => void;
  onAdd: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
  isLoading: boolean;
}

const TYPE_FILTERS: Array<{ key: TxType | "all"; label: string }> = [
  { key: "all", label: "Todos" },
  { key: TxType.income, label: "Ingresos" },
  { key: TxType.expense, label: "Gastos" },
];

/** Movements view: period + type filters over the full transaction list. */
export function TransactionsPage({
  transactions,
  period,
  onPeriodChange,
  typeFilter,
  onTypeFilterChange,
  onAdd,
  onEdit,
  onDelete,
  isLoading,
}: TransactionsPageProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Movimientos
        </h2>
        <Button
          type="button"
          size="sm"
          data-ocid="transaction.add_button"
          onClick={onAdd}
          className="rounded-lg"
        >
          <Plus className="size-4" aria-hidden="true" />
          Nuevo
        </Button>
      </div>

      <PeriodFilter period={period} onPeriodChange={onPeriodChange} />

      <div
        role="tablist"
        aria-label="Filtrar por tipo"
        className="flex gap-1 rounded-xl bg-secondary/60 p-1"
      >
        {TYPE_FILTERS.map((filter) => {
          const isActive = filter.key === typeFilter;
          return (
            <button
              key={filter.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              data-ocid={`movements.filter.${filter.key}.tab`}
              onClick={() => onTypeFilterChange(filter.key)}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-card text-foreground shadow-subtle"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <LoadingRows />
      ) : transactions.length === 0 ? (
        <div
          data-ocid="transaction.empty_state"
          className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Wallet className="size-6" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              No hay movimientos en este período
            </p>
            <p className="text-xs text-muted-foreground">
              Cambia el filtro o registra un nuevo movimiento.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            data-ocid="transaction.empty_add_button"
            onClick={onAdd}
            className="rounded-lg"
          >
            <Plus className="size-4" aria-hidden="true" />
            Registrar movimiento
          </Button>
        </div>
      ) : (
        <ul data-ocid="movements.list" className="space-y-2">
          {transactions.map((tx, index) => (
            <TransactionRow
              key={tx.id.toString()}
              tx={tx}
              index={index + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function LoadingRows() {
  return (
    <div data-ocid="movements.loading_state" className="space-y-2">
      {Array.from({ length: 5 }, (_, i) => `row-skeleton-${i}`).map((id) => (
        <div
          key={id}
          className="h-16 animate-pulse rounded-xl border border-border bg-card/60"
        />
      ))}
    </div>
  );
}
