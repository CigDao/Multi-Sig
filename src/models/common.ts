import {
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

type Result = Variant<{
    ok:nat32;
    err:string
}>;