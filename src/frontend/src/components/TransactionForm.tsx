import { Category, TxType } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { timestampToDateInput, todayDateInput } from "@/lib/finance";
import { cn } from "@/lib/utils";
import {
  CATEGORY_META,
  CATEGORY_ORDER,
  TX_TYPE_LABELS,
  type Transaction,
} from "@/types/finance";
import type { Dispatch, FormEvent, SetStateAction } from "react";

/** Editable draft for creating or updating a movement. */
export interface TransactionDraft {
  id: bigint | null;
  txType: TxType;
  amount: string;
  category: Category;
  date: string;
  note: string;
}

export function emptyDraft(): TransactionDraft {
  return {
    id: null,
    txType: TxType.expense,
    amount: "",
    category: Category.food,
    date: todayDateInput(),
    note: "",
  };
}

export function draftFromTransaction(tx: Transaction): TransactionDraft {
  return {
    id: tx.id,
    txType: tx.txType,
    amount: (Number(tx.amount) / 100).toFixed(2),
    category: tx.category,
    date: timestampToDateInput(tx.date),
    note: tx.note ?? "",
  };
}

interface TransactionFormProps {
  draft: TransactionDraft;
  setDraft: Dispatch<SetStateAction<TransactionDraft | null>>;
  error: string | null;
  isSaving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}

/** Modal form for registering or editing an income/expense movement. */
export function TransactionForm({
  draft,
  setDraft,
  error,
  isSaving,
  onSubmit,
  onClose,
}: TransactionFormProps) {
  const isEditing = draft.id !== null;

  function update<K extends keyof TransactionDraft>(
    key: K,
    value: TransactionDraft[K],
  ) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent data-ocid="transaction.dialog" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Editar movimiento" : "Nuevo movimiento"}
          </DialogTitle>
          <DialogDescription>
            Registra un ingreso o gasto con su categoría y fecha.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div
            role="tablist"
            aria-label="Tipo de movimiento"
            className="flex gap-1 rounded-xl bg-secondary/60 p-1"
          >
            {[TxType.expense, TxType.income].map((option) => {
              const isActive = draft.txType === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  data-ocid={`transaction.type.${option}.tab`}
                  onClick={() => update("txType", option)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? option === TxType.income
                        ? "bg-income/20 text-income"
                        : "bg-expense/20 text-expense"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {TX_TYPE_LABELS[option]}
                </button>
              );
            })}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="amount">Monto</Label>
            <Input
              id="amount"
              data-ocid="transaction.amount_input"
              inputMode="decimal"
              placeholder="0,00"
              value={draft.amount}
              onChange={(e) => update("amount", e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Categoría</Label>
            <Select
              value={draft.category}
              onValueChange={(value) => update("category", value as Category)}
            >
              <SelectTrigger
                id="category"
                data-ocid="transaction.category_select"
                className="w-full"
              >
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_ORDER.map((category) => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_META[category].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Fecha</Label>
            <Input
              id="date"
              type="date"
              data-ocid="transaction.date_input"
              value={draft.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">Nota (opcional)</Label>
            <Textarea
              id="note"
              data-ocid="transaction.note_textarea"
              placeholder="Añade un detalle…"
              rows={2}
              value={draft.note}
              onChange={(e) => update("note", e.target.value)}
            />
          </div>

          {error && (
            <p
              data-ocid="transaction.error_state"
              role="alert"
              className="rounded-lg bg-destructive/15 px-3 py-2 text-xs font-medium text-destructive"
            >
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="transaction.cancel_button"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              data-ocid="transaction.submit_button"
              disabled={isSaving}
            >
              {isSaving
                ? "Guardando…"
                : isEditing
                  ? "Guardar cambios"
                  : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
