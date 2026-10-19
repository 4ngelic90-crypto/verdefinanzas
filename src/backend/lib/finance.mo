import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Time "mo:core/Time";
import Common "../types/common";
import Types "../types/finance";

module {
  public type Transaction = Types.Transaction;
  public type TransactionInput = Types.TransactionInput;
  public type TransactionView = Types.Transaction;
  public type Summary = Types.Summary;
  public type CategoryTotal = Types.CategoryTotal;
  public type Period = Types.Period;
  public type FinanceError = Types.FinanceError;

  /// All movements of one caller, keyed by transaction id.
  public type Store = Map.Map<Principal, Map.Map<Common.TransactionId, Transaction>>;

  /// Flat, all-primitive projection of a movement, used by the OQL entity.
  public type TransactionRow = {
    owner : Principal;
    id : Common.TransactionId;
    txType : Text;
    amount : Nat;
    category : Text;
    date : Common.Timestamp;
    note : ?Text;
  };

  /// Flattens the nested store into one row per movement.
  public func rows(store : Store) : Iter.Iter<TransactionRow> {
    let buffer = List.empty<TransactionRow>();
    for ((owner, own) in store.entries()) {
      for (tx in own.values()) {
        buffer.add({
          owner;
          id = tx.id;
          txType = switch (tx.txType) { case (#income) { "income" }; case (#expense) { "expense" } };
          amount = tx.amount;
          category = switch (tx.category) {
            case (#food) { "food" };
            case (#transport) { "transport" };
            case (#entertainment) { "entertainment" };
            case (#home) { "home" };
            case (#health) { "health" };
            case (#other) { "other" };
          };
          date = tx.date;
          note = tx.note;
        });
      };
    };
    buffer.values();
  };

  /// Mutable counter shared with the actor.
  public type Counter = { var next : Common.TransactionId };

  /// All categories in display order.
  let categories : [Common.Category] = [
    #food,
    #transport,
    #entertainment,
    #home,
    #health,
    #other,
  ];

  /// Start of the current month (UTC), in milliseconds.
  func startOfCurrentMonth() : Common.Timestamp {
    let nowSec = Time.now() / 1_000_000_000;
    let days = nowSec / 86_400;
    let dayOfMonth = days % 30_436_875 / 1_000_000;
    ((days - dayOfMonth) * 86_400_000).toNat();
  };

  /// Start of the previous month (UTC), in milliseconds.
  func startOfPreviousMonth() : Common.Timestamp {
    let current = startOfCurrentMonth();
    let days = current / 86_400_000;
    let dayOfMonth = days % 30_436_875 / 1_000_000;
    let prevMonthDays = if (dayOfMonth == 31) { 30 } else { dayOfMonth };
    current - prevMonthDays * 86_400_000;
  };

  /// Whether `date` falls inside `period`.
  func inPeriod(period : Period, date : Common.Timestamp) : Bool {
    switch (period) {
      case (#all) { true };
      case (#currentMonth) { date >= startOfCurrentMonth() };
      case (#previousMonth) {
        date >= startOfPreviousMonth() and date < startOfCurrentMonth();
      };
    };
  };

  /// All movements of `caller`, or an empty map when none exist.
  func callerStore(store : Store, caller : Principal) : Map.Map<Common.TransactionId, Transaction> {
    switch (store.get(caller)) {
      case (?own) { own };
      case null { Map.empty() };
    };
  };

  /// Adds a movement for `caller` and returns its new id.
  public func addTransaction(
    store : Store,
    counter : Counter,
    caller : Principal,
    input : TransactionInput,
  ) : Result.Result<Transaction, FinanceError> {
    if (input.amount == 0) {
      return #err(#invalidAmount);
    };
    let id = counter.next;
    counter.next := id + 1;
    let tx : Transaction = {
      id;
      txType = input.txType;
      amount = input.amount;
      category = input.category;
      date = input.date;
      note = input.note;
    };
    let own = switch (store.get(caller)) {
      case (?own) { own };
      case null {
        let fresh = Map.empty<Common.TransactionId, Transaction>();
        store.add(caller, fresh);
        fresh;
      };
    };
    own.add(id, tx);
    #ok(tx);
  };

  /// Replaces an existing movement owned by `caller`.
  public func updateTransaction(
    store : Store,
    caller : Principal,
    id : Common.TransactionId,
    input : TransactionInput,
  ) : Result.Result<Transaction, FinanceError> {
    if (input.amount == 0) {
      return #err(#invalidAmount);
    };
    let own = callerStore(store, caller);
    switch (own.get(id)) {
      case null { #err(#notFound(id)) };
      case (?_) {
        let tx : Transaction = {
          id;
          txType = input.txType;
          amount = input.amount;
          category = input.category;
          date = input.date;
          note = input.note;
        };
        own.add(id, tx);
        #ok(tx);
      };
    };
  };

  /// Removes a movement owned by `caller`.
  public func deleteTransaction(
    store : Store,
    caller : Principal,
    id : Common.TransactionId,
  ) : Result.Result<(), FinanceError> {
    let own = callerStore(store, caller);
    switch (own.get(id)) {
      case null { #err(#notFound(id)) };
      case (?_) {
        own.remove(id);
        #ok(());
      };
    };
  };

  /// Lists movements owned by `caller`, newest first, optionally filtered.
  public func listTransactions(
    store : Store,
    caller : Principal,
    period : Period,
    txType : ?Common.TxType,
  ) : [TransactionView] {
    let own = callerStore(store, caller);
    let matched = own.values().filter(func(tx) {
      inPeriod(period, tx.date) and (
        switch (txType) {
          case null { true };
          case (?wanted) { tx.txType == wanted };
        }
      );
    }).toArray();
    matched.sort(func(a, b) {
      if (a.date > b.date) { #less } else if (a.date < b.date) { #greater } else {
        if (a.id > b.id) { #less } else if (a.id < b.id) { #greater } else { #equal };
      };
    });
  };

  /// Computes balance and totals for `caller` over `period`.
  public func getSummary(
    store : Store,
    caller : Principal,
    period : Period,
  ) : Summary {
    let own = callerStore(store, caller);
    var totalIncome = 0;
    var totalExpense = 0;
    var count = 0;
    for (tx in own.values()) {
      if (inPeriod(period, tx.date)) {
        count += 1;
        switch (tx.txType) {
          case (#income) { totalIncome += tx.amount };
          case (#expense) { totalExpense += tx.amount };
        };
      };
    };
    {
      balance = totalIncome.toInt() - totalExpense.toInt();
      totalIncome;
      totalExpense;
      transactionCount = count;
    };
  };

  /// Accumulated expense per category for `caller` over `period`.
  public func getCategoryTotals(
    store : Store,
    caller : Principal,
    period : Period,
  ) : [CategoryTotal] {
    let own = callerStore(store, caller);
    let totals = Map.empty<Common.Category, Nat>();
    var grandTotal = 0;
    for (tx in own.values()) {
      if (inPeriod(period, tx.date) and tx.txType == #expense) {
        let current = totals.get(tx.category) ?? 0;
        totals.add(tx.category, current + tx.amount);
        grandTotal += tx.amount;
      };
    };
    var topTotal = 0;
    for (category in categories.values()) {
      let total = totals.get(category) ?? 0;
      if (total > topTotal) { topTotal := total };
    };
    categories.map(func(category) {
      let total = totals.get(category) ?? 0;
      {
        category;
        total;
        percentage = if (grandTotal == 0) { 0 } else { total * 100 / grandTotal };
        isTop = total > 0 and total == topTotal;
      };
    });
  };
};
