import { VdsKeys } from './constants';
import { isRootHolder } from './rw';
import { attachDebugInfoToObject, isDebugMode } from './utils';

export interface RawObjectInfo {
    rootHolder: any;
    position: (string | symbol | number)[];
    agents?: Set<any>;
}

const rawToSensitiveObjects = new WeakMap<any, any>();
const sensitiveToRawObjects = new WeakMap<any, any>();
const reactiveToSensitiveObjects = new WeakMap<any, any>();
const rawToRawObjectInfo = new WeakMap<any, RawObjectInfo>();

export function getSensitiveObject(rawObj: any): any {
    return rawToSensitiveObjects.get(rawObj);
}

export function getRawObject(sensitiveObj: any): any {
    return sensitiveToRawObjects.get(sensitiveObj);
}

export function putRawAndSensitiveObjects(rawObj: any, sensitiveObj: any): void {
    rawToSensitiveObjects.set(rawObj, sensitiveObj);
    sensitiveToRawObjects.set(sensitiveObj, rawObj);
}

export function putReactiveAndSensitiveObjects(reactiveObj: any, sensitiveObj: any): void {
    reactiveToSensitiveObjects.set(reactiveObj, sensitiveObj);
}

export function getSensitiveObjectFromReactiveObject(reactiveObj: any): any {
    return reactiveToSensitiveObjects.get(reactiveObj);
}

export function setRootHolderAndPosition(rawObj: any, rawObjHolder: any, rawObjKey: string | symbol) {
    let currentPosition: string | symbol | number = rawObjKey;
    if (Array.isArray(rawObjHolder)) {
        currentPosition = Number.parseInt(<string>currentPosition);
    }

    const holderObjectInfo = rawToRawObjectInfo.get(rawObjHolder);
    let targetRawObjectInfo: RawObjectInfo;

    if (holderObjectInfo) {
        targetRawObjectInfo = {
            rootHolder: holderObjectInfo.rootHolder,
            position: [...holderObjectInfo.position, currentPosition]
        };
    } else {
        targetRawObjectInfo = {
            rootHolder: rawObjHolder,
            position: [currentPosition]
        };
    }

    const rawObjectInfo = rawToRawObjectInfo.get(rawObj);
    if (rawObjectInfo) {
        rawObjectInfo.rootHolder = targetRawObjectInfo.rootHolder;
        rawObjectInfo.position = targetRawObjectInfo.position;
    } else {
        rawToRawObjectInfo.set(rawObj, targetRawObjectInfo);

        if (isDebugMode()) attachDebugInfoToObject(rawObj, VdsKeys.RawObjectInfo, targetRawObjectInfo);
    }
}

export function getRawObjectInfo(sensitiveOrReactiveObj: any): RawObjectInfo {
    let rawObj = getRawObject(sensitiveOrReactiveObj);
    if (!rawObj) {
        const sensitiveObj = getSensitiveObjectFromReactiveObject(sensitiveOrReactiveObj);
        if (!sensitiveObj) return undefined;
        rawObj = getRawObject(sensitiveObj);
    }
    return rawToRawObjectInfo.get(rawObj);
}

export function getRootHolder(rawObj: any): any {
    if (isRootHolder(rawObj)) return rawObj;
    return rawToRawObjectInfo.get(rawObj)?.rootHolder;
}

export function addAgents(sensitiveObj: any, agents: Set<any>) {
    const rawObj = getRawObject(sensitiveObj);
    const rawObjectInfo = rawToRawObjectInfo.get(rawObj);

    if (rawObjectInfo.agents) {
        for (const agent of agents) {
            rawObjectInfo.agents.add(agent);
        }
    } else {
        rawObjectInfo.agents = agents;
    }
}

export function getAgents(rawObj: any): Set<any> {
    const allAgents = new Set<any>();
    const rawObjectInfo = rawToRawObjectInfo.get(rawObj);
    let currentHolder = rawObjectInfo.rootHolder;
    for (const positionItem of rawObjectInfo.position) {
        currentHolder = currentHolder[positionItem];
        const currentRawObjectInfo = rawToRawObjectInfo.get(currentHolder);
        if (currentRawObjectInfo && currentRawObjectInfo.agents) {
            for (const currentAgent of currentRawObjectInfo.agents) {
                allAgents.add(currentAgent);
            }
        }
    }
    return allAgents;
}
