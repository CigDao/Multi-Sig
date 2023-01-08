import { 
    Canister, 
    CanisterResult, 
    blob,
    Func,
    Query,
    Update,
    PreUpgrade,
    PostUpgrade,
    ic,
    Init,
    int,
    int64,
    int32,
    int16,
    int8,
    nat,
    nat64,
    nat32,
    nat16,
    nat8,
    float64,
    float32,
    Principal,
    Variant,
    Opt
 } from 'azle';

// TODO start using principals instead of strings for ids

export type Dip20Result = Variant<{
    ok: TxReceipt;
    err: string;
}>;

export type TxReceipt = Variant<{
    Ok: nat;
    Err: Variant<{
        InsufficientAllowance:null;
        InsufficientBalance:null;
        ErrorOperationStyle:null;
        Unauthorized:null;
        LedgerTrap:null;
        ErrorTo:null;
        Other: string;
        BlockUsed:null;
        AmountTooSmall:null;
    }>;
}>;

export type Dip20 = Canister<{
    transfer(to: Principal, value: nat): CanisterResult<TxReceipt>;
    balanceOf(principal: Principal): CanisterResult<nat>;
    transferFrom(from: Principal, to:Principal, value:nat): CanisterResult<TxReceipt>;
}>;