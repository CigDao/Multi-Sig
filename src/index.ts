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

import { RequestDraft, Request } from "./models/request"
import { MemberObject, Result } from "./models/common"

var threshold:nat32 = 1
var requestId:nat32 = 1;

type StableStorage = {
    members: {
        [id: string]: MemberObject;
    };
    requests: {
        [id: nat32]: Request;
    };
};

let stable_storage: StableStorage = ic.stable_storage();

export function init(_member:string,token:string): Init {
    console.log('This runs once when the canister is first initialized');
    stable_storage.members = {}
    stable_storage.requests = {}
    let member = {
        id:_member,
        power:threshold
    }
    _addmember(member);
}

export function pre_upgrade(): PreUpgrade {
    console.log('pre_upgrade');
}

export function post_upgrade(): PostUpgrade {
    console.log('post_upgrade');
}

//Query Methods
export function getMember(id: string): Query<Opt<MemberObject>> {
    const member = stable_storage.members[id] ?? null;
    return member;
}

export function getRequest(id: string): Query<Opt<Request>> {
    const request = stable_storage.requests[id] ?? null;
    return request;
}

export function fetchMembers(): Query<MemberObject[]> {
    return Object.values(stable_storage.members);
}

//Update Methods
export function createRequest(request: RequestDraft): Update<nat32> {
    let caller = ic.caller();
    if(!_isMember(caller.toText())){
        throw Error('not Authorized');
    };
    let currentId: nat32 = requestId;
    requestId = requestId + 1;
    let _request: Request = _createRequest(currentId, request);
    stable_storage.requests[currentId] = _request;
    return currentId;
}

export function approveRequest(id: string): Update<boolean> {
    let caller = ic.caller();
    if (!_isMember(caller.toText())) {
        throw Error('Not Authorized');
    };
    const request = stable_storage.requests[id] ?? null;
    const member = stable_storage.members[caller.toText()] ?? null;
    if (request) {
        if (member) {
            let _request = _approveRequest(member, request)
            stable_storage.requests[id] = _request
        } else {
            throw Error('Not Authorized');
        }
    } else {
        throw Error('Not Found');
    }
    return true;
}

export function submitRequest(request: Request): Update<boolean> {
    let caller = ic.caller();
    if(!_isMember(caller.toText())){
        throw Error('not Authorized');
    };
    if (request.transfer) {
        let result = request.transfer
        let check = _thresholdCheck(request)
        if(check){
            return true
        }else{
            return false
        }
    } else if (request.addMember) {
        let result = request.addMember
        let check = _thresholdCheck(request)
        if(check){
            let _member = {
                id: result.principal,
                power: result.power
            };
            _addmember(_member)
            return true
        }else{
            return false
        }
    } else if (request.removeMember) {
        let result = request.removeMember
        let check = _thresholdCheck(request)
        if(check){
            _removeMember(result.principal)
            return true
        }else{
            return false
        }
    } else if (request.threshold) {
        let result = request.threshold
        let check = _thresholdCheck(request)
        if(check){
            _setThreshold(result.power)
            return true
        }else{
            return false
        }
    } else {
        throw Error('Invalid Request Type');
    }
}

//Private Methods
function _createRequest(id: nat32, request: RequestDraft): Request {
    if (request.transfer) {
        let value = request.transfer;
        let result = {
            id: id,
            amount: value?.amount,
            recipient: value?.recipient,
            approvals: [],
            executed: false,
            createdAt: now(),
            executedAt: null,
            description: value?.description
        };
        return { transfer: result };
    } else if (request.addMember) {
        let value = request.addMember;
        let result = {
            id: id,
            principal: value.principal,
            power: value.power,
            description: value.description,
            approvals: [],
            executed: false,
            createdAt: now(),
            executedAt: null
        };
        return { addMember: result };
    } else if (request.removeMember) {
        let value = request.removeMember;
        let result = {
            id: id,
            principal: value.principal,
            power: 0,
            description: value.description,
            approvals: [],
            executed: false,
            createdAt: now(),
            executedAt: null
        };
        return { removeMember: result };
    } else if (request.threshold) {
        let value = request.threshold;
        let result = {
            id: id,
            power: value.power,
            description: value.description,
            approvals: [],
            executed: false,
            createdAt: now(),
            executedAt: null
        };
        return { threshold: result };
    } else {
        throw Error('Invalid Request Type');
    }
}

function _approveRequest(member: MemberObject, request: Request): Request {
    if (request.transfer) {
        let result = request.transfer
        result.approvals[member.id] = member
        return { transfer: result };
    } else if (request.addMember) {
        let result = request.addMember
        result.approvals[member.id] = member
        return { addMember: result };
    } else if (request.removeMember) {
        let result = request.removeMember
        result.approvals[member.id] = member
        return { removeMember: result };
    } else if (request.threshold) {
        let result = request.threshold
        result.approvals[member.id] = member
        return { threshold: result };
    } else {
        throw Error('Invalid Request Type');
    }
}

function _isMember(id: string): boolean {
    const member = stable_storage.members[id] ?? null;
    if (member != null) {
        return true
    } else {
        return false
    }
}

function now(): nat64 {
    return BigInt(Date.now());;
}

function _addmember(member: MemberObject) {
    stable_storage.members[member.id] = member;
    return member;
}

function _removeMember(id) {
    delete stable_storage.members[id]
}

function _setThreshold(_threshold:nat32) {
    threshold = _threshold;
}

function _thresholdCheck(request: Request): boolean {
    var power = 0;
    if (request.transfer) {
        let result = request.transfer
        result.approvals.forEach((value) => {
            power = power + value.power
        });
        
    } else if (request.addMember) {
        let result = request.addMember
        result.approvals.forEach((value) => {
            power = power + value.power
        });
    } else if (request.removeMember) {
        let result = request.removeMember
        result.approvals.forEach((value) => {
            power = power + value.power
        });
    } else if (request.threshold) {
        let result = request.threshold
        result.approvals.forEach((value) => {
            power = power + value.power
        });
    } else {
        throw Error('Invalid Request Type');
    }
    if (power >= threshold) {
        return true;
    } else {
        return false;
    }
}
