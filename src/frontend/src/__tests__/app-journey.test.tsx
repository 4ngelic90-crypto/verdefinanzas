import App from "@/App";
import {
  type MockBackend,
  TestProviders,
  createMockBackend,
  createTestQueryClient,
} from "@/__tests__/test-utils";
import { Category, Period, TxType } from "@/backend";
import type { CategoryTotal, Summary, Transaction } from "@/backend";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The app's data hooks call `useActor` from the platform package. Replacing it
 * with a local typed mock keeps the journey offline and deterministic while
 * still exercising the real components, hooks, query cache and mutations.
 */
const actorRef: { current: MockBackend | null } = { current: null };

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: actorRef.current, isFetching: false }),
}));

function summary(overrides: Partial<Summary> = {}): Summary {
  return {
    balance: 0n,
    totalIncome: 0n,
    totalExpense: 0n,
    transactionCount: 0n,
    ...overrides,
  };
}

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: 1n,
    date: BigInt(new Date(2026, 9, 15, 12).getTime()) * 1_000_000n,
    category: Category.food,
    txType: TxType.expense,
    amount: 5000n,
    ...overrides,
  };
}

function categoryTotal(overrides: Partial<CategoryTotal> = {}): CategoryTotal {
  return {
    category: Category.food,
    total: 5000n,
    percentage: 100n,
    isTop: true,
    ...overrides,
  };
}

function renderApp() {
  const client = createTestQueryClient();
  return render(
    <TestProviders client={client}>
      <App />
    </TestProviders>,
  );
}

beforeEach(() => {
  actorRef.current = null;
});

describe("Ledger Verde — flujo principal", () => {
  it("muestra el saldo disponible y los totales del período", async () => {
    const { backend } = createMockBackend({
      summary: summary({
        balance: 15000n,
        totalIncome: 20000n,
        totalExpense: 5000n,
        transactionCount: 2n,
      }),
    });
    actorRef.current = backend;

    renderApp();

    await waitFor(() => {
      expect(screen.getByTestId("balance.value")).toHaveTextContent("150,00");
    });
    expect(screen.getByText("Ingresos")).toBeInTheDocument();
    expect(screen.getByText("Gastos")).toBeInTheDocument();
  });

  it("registra un gasto y refleja el saldo actualizado tras invalidar", async () => {
    const user = userEvent.setup();
    const { backend, state } = createMockBackend({
      summary: summary({ balance: 20000n, totalIncome: 20000n }),
    });
    actorRef.current = backend;

    renderApp();

    await screen.findByTestId("balance.value");
    await user.click(screen.getByTestId("transaction.add_button"));

    const dialog = await screen.findByTestId("transaction.dialog");
    await user.type(
      within(dialog).getByTestId("transaction.amount_input"),
      "50",
    );

    // The mock's read-after-write reflects the new expense in the summary.
    state.summary = summary({
      balance: 15000n,
      totalIncome: 20000n,
      totalExpense: 5000n,
      transactionCount: 1n,
    });

    await user.click(within(dialog).getByTestId("transaction.submit_button"));

    await waitFor(() => {
      expect(state.added).toHaveLength(1);
    });
    expect(state.added[0]).toMatchObject({
      amount: 5000n,
      category: Category.food,
      txType: TxType.expense,
    });

    await waitFor(() => {
      expect(screen.getByTestId("balance.value")).toHaveTextContent("150,00");
    });
  });

  it("valida que el monto sea positivo antes de guardar", async () => {
    const user = userEvent.setup();
    const { backend, state } = createMockBackend();
    actorRef.current = backend;

    renderApp();

    await screen.findByTestId("balance.value");
    await user.click(screen.getByTestId("transaction.add_button"));

    const dialog = await screen.findByTestId("transaction.dialog");
    await user.type(
      within(dialog).getByTestId("transaction.amount_input"),
      "0",
    );
    await user.click(within(dialog).getByTestId("transaction.submit_button"));

    expect(
      await screen.findByTestId("transaction.error_state"),
    ).toHaveTextContent("Introduce un monto mayor que cero.");
    expect(state.added).toHaveLength(0);
  });

  it("alterna entre ingreso y gasto en el formulario", async () => {
    const user = userEvent.setup();
    const { backend, state } = createMockBackend();
    actorRef.current = backend;

    renderApp();

    await screen.findByTestId("balance.value");
    await user.click(screen.getByTestId("transaction.add_button"));

    const dialog = await screen.findByTestId("transaction.dialog");
    const incomeTab = within(dialog).getByTestId("transaction.type.income.tab");
    await user.click(incomeTab);
    expect(incomeTab).toHaveAttribute("aria-selected", "true");

    await user.type(
      within(dialog).getByTestId("transaction.amount_input"),
      "200",
    );
    await user.click(within(dialog).getByTestId("transaction.submit_button"));

    await waitFor(() => {
      expect(state.added).toHaveLength(1);
    });
    expect(state.added[0].txType).toBe(TxType.income);
    expect(state.added[0].amount).toBe(20000n);
  });

  it("navega entre Inicio, Movimientos y Estadísticas sin recargar", async () => {
    const user = userEvent.setup();
    const { backend } = createMockBackend({
      transactions: [tx()],
      categoryTotals: [categoryTotal()],
    });
    actorRef.current = backend;

    renderApp();

    await screen.findByTestId("home.page");

    await user.click(screen.getByTestId("nav.movimientos.tab"));
    expect(await screen.findByTestId("movements.list")).toBeInTheDocument();

    await user.click(screen.getByTestId("nav.estadisticas.tab"));
    expect(await screen.findByTestId("stats.page")).toBeInTheDocument();

    await user.click(screen.getByTestId("nav.inicio.tab"));
    expect(await screen.findByTestId("home.page")).toBeInTheDocument();
  });

  it("resalta la categoría con mayor gasto en el gráfico", async () => {
    const user = userEvent.setup();
    const { backend } = createMockBackend({
      categoryTotals: [
        categoryTotal({
          category: Category.food,
          total: 5000n,
          percentage: 71n,
          isTop: true,
        }),
        categoryTotal({
          category: Category.transport,
          total: 2000n,
          percentage: 29n,
          isTop: false,
        }),
      ],
    });
    actorRef.current = backend;

    renderApp();

    await screen.findByTestId("home.page");
    await user.click(screen.getByTestId("nav.estadisticas.tab"));

    const topLabel = await screen.findByTestId("top_category.label");
    expect(topLabel).toHaveTextContent("Comida");
    expect(screen.getByTestId("top_category.percentage")).toHaveTextContent(
      "71%",
    );
  });

  it("muestra el estado vacío del gráfico cuando no hay gastos", async () => {
    const { backend } = createMockBackend();
    actorRef.current = backend;

    renderApp();

    expect(await screen.findByTestId("category.empty_state")).toHaveTextContent(
      "Aún no hay gastos registrados",
    );
  });

  it("elimina un movimiento existente tras confirmar", async () => {
    const user = userEvent.setup();
    const { backend, state } = createMockBackend({
      transactions: [tx({ id: 7n })],
    });
    actorRef.current = backend;

    renderApp();

    await screen.findByTestId("home.page");
    await user.click(screen.getByTestId("nav.movimientos.tab"));

    await user.click(await screen.findByTestId("transaction.delete_button.1"));

    const dialog = await screen.findByTestId("transaction.delete_dialog");
    await user.click(within(dialog).getByTestId("transaction.confirm_button"));

    await waitFor(() => {
      expect(state.deleted).toEqual([7n]);
    });
  });

  it("filtra los movimientos por tipo", async () => {
    const user = userEvent.setup();
    const { backend } = createMockBackend({
      transactions: [tx({ id: 1n, txType: TxType.expense })],
    });
    actorRef.current = backend;

    renderApp();

    await screen.findByTestId("home.page");
    await user.click(screen.getByTestId("nav.movimientos.tab"));

    const expenseFilter = await screen.findByTestId(
      "movements.filter.expense.tab",
    );
    await user.click(expenseFilter);
    expect(expenseFilter).toHaveAttribute("aria-selected", "true");
  });

  it("cambia el período visible desde el filtro", async () => {
    const user = userEvent.setup();
    const { backend } = createMockBackend();
    actorRef.current = backend;

    renderApp();

    await screen.findByTestId("home.page");
    const allTab = screen.getByTestId(`period.${Period.all}.tab`);
    await user.click(allTab);
    expect(allTab).toHaveAttribute("aria-selected", "true");
  });
});
