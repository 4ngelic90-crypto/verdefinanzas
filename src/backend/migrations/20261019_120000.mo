import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type OldActor = {};

  type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    transactions : Map.Map<Principal, Map.Map<Nat, Transaction>>;
    counter : { var next : Nat };
  };

  type Transaction = {
    id : Nat;
    txType : { #income; #expense };
    amount : Nat;
    category : { #food; #transport; #entertainment; #home; #health; #other };
    date : Nat;
    note : ?Text;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      transactions = Map.empty();
      counter = { var next = 0 };
    };
  };
};
