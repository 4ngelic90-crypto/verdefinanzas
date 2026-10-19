import Nat "mo:core/Nat";
import Order "mo:core/Order";

module {
  /// Milliseconds since the Unix epoch.
  public type Timestamp = Nat;

  /// Identifier of a transaction.
  public type TransactionId = Nat;

  /// Whether a movement adds to or subtracts from the balance.
  public type TxType = {
    #income;
    #expense;
  };

  /// Predefined spending/earning categories.
  public type Category = {
    #food;
    #transport;
    #entertainment;
    #home;
    #health;
    #other;
  };

  /// Total order over categories, used as the `Map` key comparator.
  public func compare(a : Category, b : Category) : Order.Order {
    func rank(c : Category) : Nat {
      switch (c) {
        case (#food) { 0 };
        case (#transport) { 1 };
        case (#entertainment) { 2 };
        case (#home) { 3 };
        case (#health) { 4 };
        case (#other) { 5 };
      };
    };
    Nat.compare(rank(a), rank(b));
  };
};
