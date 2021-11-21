import { clone } from 'lodash';
import { VdsKeys } from './constants';

export function isCollectionObject(obj: any): boolean {
    return obj instanceof Map || obj instanceof Set || obj instanceof WeakMap || obj instanceof WeakSet;
}

export function isDebugMode(): boolean {
    return true;
    // return window.lucid.debugMode;
}

export function attachDebugInfoToObject(targetObj: any, debugInfoKey: string, debugInfo: any): void {
    Reflect.defineProperty(targetObj, debugInfoKey, {
        value: debugInfo,
        writable: false,
        enumerable: false,
        configurable: false
    });
}

export function isVdsKey(key: string | symbol): boolean {
    if (typeof key === 'symbol') return false;

    for (const vdsKey in VdsKeys) {
        const vdsKeys: any = VdsKeys;
        if (key === vdsKeys[vdsKey]) {
            return true;
        }
    }
    return false;
}

const originalObjToClonedObj = new Map();

export function cloneDeepForSnapshot(originalObj: any | any[], substepCallback?: (originalObj: any, clonedObj: any) => void): any {
    const clonedResult = baseCloneForSnapshot(originalObj, substepCallback);
    originalObjToClonedObj.clear();
    return clonedResult;
}

function baseCloneForSnapshot(originalObj: any | any[], substepCallback?: (originalObj: any, clonedObj: any) => void): any | any[] {
    const originalObjType = typeof originalObj;
    if (originalObjType === 'object' && originalObjType !== null) {
        let clonedObj = originalObjToClonedObj.get(originalObj);
        if (clonedObj) return clonedObj;

        clonedObj = clone(originalObj);
        originalObjToClonedObj.set(originalObj, clonedObj);

        if (substepCallback) substepCallback(originalObj, clonedObj);

        if (Array.isArray(clonedObj)) {
            for (let i = 0; i < clonedObj.length; i++) {
                clonedObj[i] = baseCloneForSnapshot(clonedObj[i], substepCallback);
            }
            return clonedObj;
        }

        if (clonedObj instanceof WeakMap) {
            console.error('快照或快照中的元素不能是WeakMap类型！\n', clonedObj);
            return undefined;
        } else if (clonedObj instanceof WeakSet) {
            console.error('快照或快照中的元素不能是WeakSet类型！\n', clonedObj);
            return undefined;
        } else if (clonedObj instanceof Map) {
            for (const [clonedObjKey, clonedObjValue] of clonedObj) {
                clonedObj.set(clonedObjKey, baseCloneForSnapshot(clonedObjValue, substepCallback));
            }
        } else if (clonedObj instanceof Set) {
            const clonedObjArray = [...clonedObj];
            clonedObj.clear();
            for (const clonedObjArrayItem of clonedObjArray) {
                clonedObj.add(baseCloneForSnapshot(clonedObjArrayItem, substepCallback));
            }
        } else {
            const clonedObjKeys = Object.keys(originalObj);
            for (const clonedObjKey of clonedObjKeys) {
                clonedObj[clonedObjKey] = baseCloneForSnapshot(clonedObj[clonedObjKey], substepCallback);
            }
        }

        return clonedObj;
    }
    return originalObj;
}

export function tryToSetValueToContent(value: any, host: any): boolean {
    if (Array.isArray(host) && Array.isArray(value)) {
        host.splice(0, host.length, ...value);
        return true;
    } else if (!isCollectionObject(host) && !isCollectionObject(value) && !Array.isArray(host) && !Array.isArray(value)) {
        for (const hostKey of Object.keys(host)) {
            delete host[hostKey];
        }
        for (const rawSnapshotCopyKey of Object.keys(value)) {
            host[rawSnapshotCopyKey] = value[rawSnapshotCopyKey];
        }
        return true;
    }
    return false;
}
