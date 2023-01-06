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

type Request = Variant<{
    transfer:Transfer;
    addMember:Member;
    removeMember:Member;
    threshold:Threshold;
}>;

type Transfer = {
    id:nat32;
    amount:nat;
    recipient:string;
    approvals:{};
    executed:boolean;
    createdAt:int;
    executedAt?:int;
    description:string;
};
type Member = {
    id:nat32;
    principal:string;
    power:nat;
    description:string;
    approvals:{};
    executed:boolean;
    createdAt:int;
    executedAt?:int;
};
type Threshold = {
    id:nat32;
    power:nat;
    description:string;
    approvals:{};
    executed:boolean;
    createdAt:int;
    executedAt?:int;
};

type RequestDraft = Variant<{
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
    power:nat;
    description:string;
};

type ThresholdDraft = {
    power:nat;
    description:string;
};

type Result = Variant<{
    ok:nat32;
    err:string
}>;

var requestId:nat32 = 1;

type MemberObject = {
    id: string;
    power: nat32;
};

type StableStorage = {
    members: {
        [id: string]: MemberObject;
    };
    requests: {
        [id: nat32]: Request;
    };
};

let stable_storage: StableStorage = ic.stable_storage();

/*export function init(members:[MemberObject]): Init {
    console.log('This runs once when the canister is first initialized');
    members.forEach(member => {
        _addmember(member);
    });
}*/

export function pre_upgrade(): PreUpgrade {
    console.log('pre_upgrade');
}

export function post_upgrade(): PostUpgrade {
    console.log('post_upgrade');
}

export function getMember(id: string): Query<Opt<MemberObject>> {
    const member = stable_storage.members[id] ?? null;
    return member;
}

/*export function fetchMembers(): Query<MemberObject[]> {
    return Object.values(stable_storage.db.members);
}

export function deleteMember(id:string): Update<void> {
    delete db.members[id];
    stable_storage.db = db;
}*/

//Update Methods

export function createRequest(request:RequestDraft): Update<nat32> {
    let caller = ic.caller();
    if(!_isMember(caller.toText())){
        throw Error('not Authorized');
    };
    let currentId:nat32 = requestId;
    requestId = requestId+1;
    let _request:Request = _createRequest(currentId, request);
    stable_storage.requests[currentId] = _request;
    //stable_storage.db = db;
    return currentId;
}

/*export function approveRequest(request:Request): Update<boolean> {
    let caller = ic.caller();
    console.log(typeof caller);
    return true;
}

export function submitRequest(request:Request): Update<boolean> {
    let caller = ic.caller();
    console.log(typeof caller);
    return true;
}*/

//Private Methods

function _createRequest(id:nat32, request : RequestDraft) : Request {
    if (!transfer(request)) {
        let value = request.transfer;
        let result = {
            id:id,
            amount:value?.amount,
            recipient:value?.recipient,
            approvals:{},
            executed:false,
            createdAt:now(),
            executedAt:null,
            description:value?.description
        };
        return {transfer:result};
    }else if(!addMember(request)){
        let value = canister_result.addMember;
        let result = {
            id:id,
            principal:value.principal,
            power:value.power,
            description:value.description,
            approvals:{},
            executed:false,
            createdAt:now(),
            executedAt:null
        };
        return {addMember:result};
    }else if(!removeMember(request)){
        let value = canister_result.removeMember;
        let result = {
            id:id,
            principal:value.principal,
            power:0,
            description:value.description,
            approvals:{},
            executed:false,
            createdAt:now(),
            executedAt:null
        };
        return {removeMember:result};
    }else if(!threshold(request)){
        let value = canister_result.threshold;
        let result = {
            id:id,
            power:value.power,
            description:value.description,
            approvals:{},
            executed:false,
            createdAt:now(),
            executedAt:null
        };
        return {threshold:result};
    }else {
        throw Error('Invalid Request Type');
    }
}


/*function _addmember(member: Member): Member {
    db.members[member.id] = member;
    stable_storage.db = db;
    return member;
}*/

function _isMember(id:string): boolean {
    const member = stable_storage.members[id] ?? null;
    if(member != null){
        return true
    }else {
        return false
    }
}

function now(): nat64 {
    return BigInt(Date.now());;
}

/*function removeMember(): Update<Member[]> {
    db.members
}

function _setThreshold(): Query<Member[]> {
    return Object.values(stable_storage.db.members);
}*/
