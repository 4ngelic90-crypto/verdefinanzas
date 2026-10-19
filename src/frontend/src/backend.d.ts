import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CategoryTotal {
    total: bigint;
    category: Category;
    isTop: boolean;
    percentage: bigint;
}
export interface Cell {
    value: Value;
    name: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type FinanceError = {
    __kind__: "notAuthorized";
    notAuthorized: null;
} | {
    __kind__: "notFound";
    notFound: TransactionId;
} | {
    __kind__: "invalidAmount";
    invalidAmount: null;
};
export type Result = {
    __kind__: "ok";
    ok: Transaction;
} | {
    __kind__: "err";
    err: FinanceError;
};
export type Result_1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: FinanceError;
};
export type Result_2 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface Summary {
    balance: bigint;
    totalIncome: bigint;
    totalExpense: bigint;
    transactionCount: bigint;
}
export type Timestamp = bigint;
export interface Transaction {
    id: TransactionId;
    date: Timestamp;
    note?: string;
    category: Category;
    txType: TxType;
    amount: bigint;
}
export type TransactionId = bigint;
export interface TransactionInput {
    date: Timestamp;
    note?: string;
    category: Category;
    txType: TxType;
    amount: bigint;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum Category {
    other = "other",
    entertainment = "entertainment",
    food = "food",
    home = "home",
    transport = "transport",
    health = "health"
}
export enum Period {
    all = "all",
    previousMonth = "previousMonth",
    currentMonth = "currentMonth"
}
export enum TxType {
    expense = "expense",
    income = "income"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Registers a new income or expense for the caller.
     */
    addTransaction(input: TransactionInput): Promise<Result>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Deletes a movement owned by the caller.
     */
    deleteTransaction(id: TransactionId): Promise<Result_1>;
    execute(qJson: string): Promise<Result__1>;
    /**
     * / Returns the backend API documentation as static Markdown.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Returns accumulated expense per category for the caller.
     */
    getCategoryTotals(period: Period): Promise<Array<CategoryTotal>>;
    /**
     * / Returns balance and totals for the caller over the given period.
     */
    getSummary(period: Period): Promise<Summary>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Lists the caller's movements, newest first.
     */
    listTransactions(period: Period, txType: TxType | null): Promise<Array<Transaction>>;
    schema(): Promise<string>;
    /**
     * / Updates an existing movement owned by the caller.
     */
    updateTransaction(id: TransactionId, input: TransactionInput): Promise<Result>;
}
