import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Common "../types/common";
import Types "../types/finance";
import FinanceLib "../lib/finance";

mixin (
  store : FinanceLib.Store,
  counter : FinanceLib.Counter,
) {
  /// Registers a new income or expense for the caller.
  public shared ({ caller }) func addTransaction(
    input : Types.TransactionInput
  ) : async Result.Result<Types.Transaction, Types.FinanceError> {
    FinanceLib.addTransaction(store, counter, caller, input);
  };

  /// Updates an existing movement owned by the caller.
  public shared ({ caller }) func updateTransaction(
    id : Common.TransactionId,
    input : Types.TransactionInput,
  ) : async Result.Result<Types.Transaction, Types.FinanceError> {
    FinanceLib.updateTransaction(store, caller, id, input);
  };

  /// Deletes a movement owned by the caller.
  public shared ({ caller }) func deleteTransaction(
    id : Common.TransactionId
  ) : async Result.Result<(), Types.FinanceError> {
    FinanceLib.deleteTransaction(store, caller, id);
  };

  /// Lists the caller's movements, newest first.
  public query ({ caller }) func listTransactions(
    period : Types.Period,
    txType : ?Common.TxType,
  ) : async [Types.Transaction] {
    FinanceLib.listTransactions(store, caller, period, txType);
  };

  /// Returns balance and totals for the caller over the given period.
  public query ({ caller }) func getSummary(
    period : Types.Period
  ) : async Types.Summary {
    FinanceLib.getSummary(store, caller, period);
  };

  /// Returns accumulated expense per category for the caller.
  public query ({ caller }) func getCategoryTotals(
    period : Types.Period
  ) : async [Types.CategoryTotal] {
    FinanceLib.getCategoryTotals(store, caller, period);
  };
};
