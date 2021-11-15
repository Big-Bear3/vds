import { VdsKeys } from './constants';
import { getAgents, getRootHolder } from './mapping';
import { attachDebugInfoToObject, isDebugMode } from './utils';

interface RootHolderAttachedInfo {
    writable: boolean;
}

const rootHolderAttachedInfoMap = new WeakMap<any, RootHolderAttachedInfo>();

export function isWritableState(holder: any, showError = true): boolean {
    let rootHolder: any;
    const holderIsRootHolder = isRootHolder(holder);
    if (holderIsRootHolder) {
        rootHolder = holder;
    } else {
        rootHolder = getRootHolder(holder);
    }

    const rootHolderWritable = rootHolderAttachedInfoMap.get(rootHolder).writable;

    if (!rootHolderWritable) {
        if (!holderIsRootHolder) {
            const agents = getAgents(holder);
            for (const agent of agents) {
                const agentWritable = rootHolderAttachedInfoMap.get(agent)?.writable;
                if (agentWritable) return true;
            }
        }
        if (showError) {
            console.error('禁止在没有被Rw()装饰器装饰的函数内，或非rw()函数内修改Hold()装饰器装饰的对象！');
        }
        return false;
    }

    return true;
}

export function lockWriteForRootHolder(rootHolder: any): void {
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

export function unlockWriteForRootHolder(rootHolder: any): void {
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

export function isRootHolder(holder: any): boolean {
    return !!rootHolderAttachedInfoMap.get(holder);
}

export function rw(holder: any, rwAble: () => void): void {
    unlockWriteForRootHolder(holder);
    rwAble();
    lockWriteForRootHolder(holder);
}

export function Rw(): MethodDecorator {
    return function (_target: any, _key: string | any, descriptor: PropertyDescriptor) {
        const originFun = descriptor.value;
        descriptor.value = function (...args: any[]) {
            unlockWriteForRootHolder(this);
            if (args === undefined) {
                originFun.call(this);
            } else {
                originFun.call(this, ...args);
            }
            lockWriteForRootHolder(this);
        };
    };
}
