import { Period, type TxType } from "@/backend";
import type { Transaction, TransactionInput } from "@/backend";
import { BottomNav, type TabKey } from "@/components/BottomNav";
import { Layout } from "@/components/Layout";
import {
  type TransactionDraft,
  TransactionForm,
  draftFromTransaction,
  emptyDraft,
} from "@/components/TransactionForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAddTransaction,
  useCategoryTotals,
  useDeleteTransaction,
  useSummary,
  useTransactions,
  useUpdateTransaction,
} from "@/hooks/use-finance";
import {
  categoryLabel,
  dateInputToTimestamp,
  formatCurrency,
  parseAmountToCents,
} from "@/lib/finance";
import { HomePage } from "@/pages/HomePage";
import { StatsPage } from "@/pages/StatsPage";
import { TransactionsPage } from "@/pages/TransactionsPage";
import { useState } from "react";

export default function App() {
  const [tab, setTab] = useState<TabKey>("inicio");
  const [period, setPeriod] = useState<Period>(Period.currentMonth);
  const [typeFilter, setTypeFilter] = useState<TxType | "all">("all");
  const [draft, setDraft] = useState<TransactionDraft | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);

  const summaryQuery = useSummary(period);
  const transactionsQuery = useTransactions(
    period,
    typeFilter === "all" ? null : typeFilter,
  );
  const categoryQuery = useCategoryTotals(period);

  const addMutation = useAddTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();

  const summary = summaryQuery.data ?? null;
  const transactions = transactionsQuery.data ?? [];
  const categoryTotals = categoryQuery.data ?? [];

  const isSaving = addMutation.isPending || updateMutation.isPending;

  function openCreate() {
    setFormError(null);
    setDraft(emptyDraft());
  }

  function openEdit(tx: Transaction) {
    setFormError(null);
    setDraft(draftFromTransaction(tx));
  }

  function closeForm() {
    setDraft(null);
    setFormError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;

    const cents = parseAmountToCents(draft.amount);
    if (cents === null) {
      setFormError("Introduce un monto mayor que cero.");
      return;
    }
    if (!draft.category) {
      setFormError("Selecciona una categoría.");
      return;
    }

    const input: TransactionInput = {
      amount: cents,
      category: draft.category,
      txType: draft.txType,
      date: dateInputToTimestamp(draft.date),
      note: draft.note.trim() === "" ? undefined : draft.note.trim(),
    };

    const editingId = draft.id;
    setFormError(null);
    closeForm();

    if (editingId === null) {
      addMutation.mutate(input, {
        onError: () => setFormError("No se pudo guardar el movimiento."),
      });
    } else {
      updateMutation.mutate(
        { id: editingId, input },
        { onError: () => setFormError("No se pudo actualizar el movimiento.") },
      );
    }
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    const id = pendingDelete.id;
    setPendingDelete(null);
    deleteMutation.mutate(id);
  }

  return (
    <Layout>
      {tab === "inicio" && (
        <HomePage
          summary={summary}
          transactions={transactions}
          categoryTotals={categoryTotals}
          period={period}
          onPeriodChange={setPeriod}
          onAdd={openCreate}
          onEdit={openEdit}
          onSeeAll={() => setTab("movimientos")}
          isLoading={summaryQuery.isLoading}
        />
      )}

      {tab === "movimientos" && (
        <TransactionsPage
          transactions={transactions}
          period={period}
          onPeriodChange={setPeriod}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onAdd={openCreate}
          onEdit={openEdit}
          onDelete={setPendingDelete}
          isLoading={transactionsQuery.isLoading}
        />
      )}

      {tab === "estadisticas" && (
        <StatsPage
          categoryTotals={categoryTotals}
          period={period}
          onPeriodChange={setPeriod}
          isLoading={categoryQuery.isLoading}
        />
      )}

      <BottomNav active={tab} onChange={setTab} />

      {draft && (
        <TransactionForm
          draft={draft}
          setDraft={setDraft}
          error={formError}
          isSaving={isSaving}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent data-ocid="transaction.delete_dialog">
          <DialogHeader>
            <DialogTitle>Eliminar movimiento</DialogTitle>
            <DialogDescription>
              {pendingDelete
                ? `Se eliminará ${categoryLabel(pendingDelete.category)} por ${formatCurrency(
                    pendingDelete.amount,
                  )}. Esta acción no se puede deshacer.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              data-ocid="transaction.cancel_button"
              onClick={() => setPendingDelete(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              data-ocid="transaction.confirm_button"
              onClick={confirmDelete}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
