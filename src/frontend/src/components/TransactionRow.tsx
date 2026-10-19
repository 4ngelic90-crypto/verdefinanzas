import { TxType } from "@/backend";
import { formatDate, formatSignedCurrency } from "@/lib/finance";
import { cn } from "@/lib/utils";
import { CATEGORY_META, type Transaction } from "@/types/finance";
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2 } from "lucide-react";

interface TransactionRowProps {
  tx: Transaction;
  /** 1-based position used for deterministic test markers. */
  index: number;
  onEdit: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
}

/** A single movement: category, date/note, signed amount and row actions. */
export function TransactionRow({
  tx,
  index,
  onEdit,
  onDelete,
}: TransactionRowProps) {
  const meta = CATEGORY_META[tx.category];
  const isIncome = tx.txType === TxType.income;

  return (
    <li
      data-ocid={`transaction.item.${index}`}
      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/30"
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full",
          isIncome ? "bg-income/15 text-income" : "bg-expense/15 text-expense",
        )}
        aria-hidden="true"
      >
        {isIncome ? (
          <ArrowUpRight className="size-5" />
        ) : (
          <ArrowDownLeft className="size-5" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {meta.label}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {formatDate(tx.date)}
          {tx.note ? ` · ${tx.note}` : ""}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span
          className={cn(
            "tabular text-sm font-semibold",
            isIncome ? "text-income" : "text-expense",
          )}
        >
          {formatSignedCurrency(tx.amount, tx.txType)}
        </span>
        <button
          type="button"
          data-ocid={`transaction.edit_button.${index}`}
          aria-label={`Editar ${meta.label}`}
          onClick={() => onEdit(tx)}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <Pencil className="size-4" aria-hidden="true" />
        </button>
        {onDelete && (
          <button
            type="button"
            data-ocid={`transaction.delete_button.${index}`}
            aria-label={`Eliminar ${meta.label}`}
            onClick={() => onDelete(tx)}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </li>
  );
}
