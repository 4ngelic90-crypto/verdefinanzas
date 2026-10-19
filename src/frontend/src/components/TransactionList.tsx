import { TransactionRow } from "@/components/TransactionRow";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/types/finance";
import { Plus, Wallet } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
  onAdd: () => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  /** ocid prefix for list + empty-state markers, e.g. "home.recent". */
  ocidPrefix?: string;
}

/** Renders a list of transactions with edit/delete affordances and empty/loading states. */
export function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onAdd,
  isLoading = false,
  emptyTitle = "Sin movimientos todavía",
  emptyDescription = "Registra tu primer ingreso o gasto para ver el resumen aquí.",
  ocidPrefix = "transaction",
}: TransactionListProps) {
  if (isLoading) {
    return <LoadingRows />;
  }

  if (transactions.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        onAdd={onAdd}
      />
    );
  }

  return (
    <ul data-ocid={`${ocidPrefix}.list`} className="space-y-2">
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
  );
}

function EmptyState({
  title,
  description,
  onAdd,
}: {
  title: string;
  description: string;
  onAdd: () => void;
}) {
  return (
    <div
      data-ocid="transaction.empty_state"
      className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card/50 px-6 py-10 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Wallet className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
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
  );
}

function LoadingRows() {
  return (
    <div data-ocid="transaction.loading_state" className="space-y-2">
      {Array.from({ length: 5 }, (_, i) => `row-skeleton-${i}`).map((id) => (
        <div
          key={id}
          className="h-16 animate-pulse rounded-xl border border-border bg-card/60"
        />
      ))}
    </div>
  );
}
