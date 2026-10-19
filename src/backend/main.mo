import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import FinanceLib "lib/finance";
import FinanceApi "mixins/finance-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let transactions : FinanceLib.Store;
  let counter : FinanceLib.Counter;

  include MixinAuthorization(accessControlState, null);
  include FinanceApi(transactions, counter);
  include ApiDocMixin();
  include Expose({
    entities = [
      OQL.Entity.manual<FinanceLib.TransactionRow>(
        "transaction",
        func () = FinanceLib.rows(transactions),
        "Transaction",
        "id",
      )
        .sample({
          owner = Principal.fromText("aaaaa-aa");
          id = 0;
          txType = "expense";
          amount = 0;
          category = "other";
          date = 0;
          note = ?"";
        })
        .payload("owner", func r = r.owner)
        .payload("id", func r = r.id)
        .payload("txType", func r = r.txType)
        .payload("amount", func r = r.amount)
        .payload("category", func r = r.category)
        .payload("date", func r = r.date)
        .payload("note", func r = r.note)
        .controllerOnly()
        .build(),
    ];
  });
};
