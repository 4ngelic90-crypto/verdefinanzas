import { createActor } from "@/backend";
import type { Period, TransactionInput, TxType } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSummary(period: Period) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["summary", period],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSummary(period);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTransactions(period: Period, txType: TxType | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["transactions", period, txType],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTransactions(period, txType);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCategoryTotals(period: Period) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["categoryTotals", period],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategoryTotals(period);
    },
    enabled: !!actor && !isFetching,
  });
}

function useInvalidateFinance() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["summary"] });
    void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    void queryClient.invalidateQueries({ queryKey: ["categoryTotals"] });
  };
}

export function useAddTransaction() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (input: TransactionInput) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.addTransaction(input);
      if (result.__kind__ === "err") throw new Error(result.err.__kind__);
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useUpdateTransaction() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: { id: bigint; input: TransactionInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.updateTransaction(id, input);
      if (result.__kind__ === "err") throw new Error(result.err.__kind__);
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Backend is not ready");
      const result = await actor.deleteTransaction(id);
      if (result.__kind__ === "err") throw new Error(result.err.__kind__);
      return result.ok;
    },
    onSuccess: () => {
      invalidate();
    },
  });
}
