import { VdsKeys } from './constants';
import { getRootHolder } from './mapping';
import { attachDebugInfoToObject, isDebugMode } from './utils';

interface RootHolderAttachedInfo {
    writable: boolean;
}

const rootHolderAttachedInfoMap = new WeakMap<any, RootHolderAttachedInfo>();

export function isWritableState(holder: any, showError = true): boolean {
    const rootHolder = getRootHolder(holder);
    const holderWritable = rootHolderAttachedInfoMap.get(rootHolder).writable;
    if (!holderWritable && showError)
        console.error('禁止在没有被Rw()装饰器装饰的函数内，或非rw()函数内修改Hold()装饰器装饰的对象！');

    return holderWritable;
}

export function lockWriteForHolder(rootHolder: any): void {
    const rootHolderAttachedInfo = rootHolderAttachedInfoMap.get(rootHolder);
    if (rootHolderAttachedInfo) {
        rootHolderAttachedInfo.writable = false;
    } else {
        const rootHolderAttachedInfo = {
            writable: false
        };
        rootHolderAttachedInfoMap.set(rootHolder, rootHolderAttachedInfo);

        if (isDebugMode()) attachDebugInfoToObject(rootHolder, VdsKeys.RootHolderAttachedInfo, rootHolderAttachedInfo);
    }
}

export function unlockWriteForHolder(rootHolder: any): void {
    const rootHolderAttachedInfo = rootHolderAttachedInfoMap.get(rootHolder);
    if (rootHolderAttachedInfo) {
        rootHolderAttachedInfo.writable = true;
    } else {
        const rootHolderAttachedInfo = {
            writable: true
        };
        rootHolderAttachedInfoMap.set(rootHolder, rootHolderAttachedInfo);

        if (isDebugMode()) attachDebugInfoToObject(rootHolder, VdsKeys.RootHolderAttachedInfo, rootHolderAttachedInfo);
    }
}

export function rw(holder: any, rwAble: () => void): void {
    unlockWriteForHolder(holder);
    rwAble();
    lockWriteForHolder(holder);
}

export function Rw(): MethodDecorator {
    return function (_target: any, _key: string | any, descriptor: PropertyDescriptor) {
        const originFun = descriptor.value;
        descriptor.value = function (...args: any[]) {
            unlockWriteForHolder(this);
            if (args === undefined) {
                originFun.call(this);
            } else {
                originFun.call(this, ...args);
            }
            lockWriteForHolder(this);
        };
    };
}
