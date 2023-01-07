import {
    Func,
    ic,
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
import { MemberObject, Result } from "./common"

export type Request = Variant<{
    transfer:Transfer;
    addMember:Member;
    removeMember:Member;
    threshold:Threshold;
}>;

type Transfer = {
    id:nat32;
    amount:nat;
    recipient:string;
    approvals:MemberObject[];
    executed:boolean;
    createdAt:int;
    executedAt:Opt<int>;
    description:string;
};
type Member = {
    id:nat32;
    principal:string;
    power:nat32;
    description:string;
    approvals:MemberObject[];
    executed:boolean;
    createdAt:int;
    executedAt:Opt<int>;
};
type Threshold = {
    id:nat32;
    power:nat32;
    description:string;
    approvals:MemberObject[];
    executed:boolean;
    createdAt:int;
    executedAt:Opt<int>;
};

export type RequestDraft = Variant<{
    transfer:TransferDraft;
    addMember:MemberDraft;
    removeMember:MemberDraft;
    threshold:ThresholdDraft;
}>;

type TransferDraft = {
    amount:nat;
    recipient:string;
    description:string;
};

type MemberDraft = {
    principal:string;
    power:nat32;
    description:string;
};

type ThresholdDraft = {
    power:nat32;
    description:string;
};