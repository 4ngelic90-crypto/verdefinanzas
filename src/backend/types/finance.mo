import Common "../types/common";

module {
  public type Timestamp = Common.Timestamp;
  public type TransactionId = Common.TransactionId;
  public type TxType = Common.TxType;
  public type Category = Common.Category;

  /// A stored movement. Amounts are integer cents (positive).
  public type Transaction = {
    id : TransactionId;
    txType : TxType;
    amount : Nat;
    category : Category;
    date : Timestamp;
    note : ?Text;
  };

  /// Payload accepted when creating or updating a movement.
  public type TransactionInput = {
    txType : TxType;
    amount : Nat;
    category : Category;
    date : Timestamp;
    note : ?Text;
  };

  /// Period filter for the summary and the category chart.
  public type Period = {
    #currentMonth;
    #previousMonth;
    #all;
  };

  /// Aggregated totals for the visible period.
  public type Summary = {
    balance : Int;
    totalIncome : Nat;
    totalExpense : Nat;
    transactionCount : Nat;
  };

  /// Accumulated expense for one category, with its share of total expense.
  public type CategoryTotal = {
    category : Category;
    total : Nat;
    percentage : Nat;
    isTop : Bool;
  };

  /// Caller-visible failures.
  public type FinanceError = {
    #invalidAmount;
    #notFound : TransactionId;
    #notAuthorized;
  };
};
