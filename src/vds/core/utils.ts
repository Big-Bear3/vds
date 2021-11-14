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
