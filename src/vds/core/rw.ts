import { VdsKeys } from './constants';
import { getAgents, getRootHolder } from './mapping';
import { attachDebugInfoToObject, isDebugMode } from './utils';

interface RootHolderAttachedInfo {
    writable: boolean;
}

const rootHolderAttachedInfoMap = new WeakMap<any, RootHolderAttachedInfo>();

let isUnlockingState = false;

export function isWritableState(holder: any, key: string | symbol): boolean {
    let rootHolder: any;
    if (isRootHolder(holder)) {
        rootHolder = holder;
    } else {
        rootHolder = getRootHolder(holder);
    }

    const rootHolderWritable = rootHolderAttachedInfoMap.get(rootHolder).writable;

    if (!rootHolderWritable) {
        const agents = getAgents(rootHolder);
        if (agents) {
            for (const agent of agents) {
                const agentWritable = rootHolderAttachedInfoMap.get(agent)?.writable;
                if (agentWritable) return true;
            }
        }
        if (isUnlockingState) {
            console.error(
                '当前方法无修改目标对象权限，请确认此方法是否与要修改的对象在同一实例内，或是否为当前实例注册了目标对象所在实例的代理！\n尝试修改的对象：',
                holder,
                '\n尝试修改属性或索引：',
                key
            );
        } else {
            console.error(
                '禁止在没有被Rw()装饰器装饰的函数内，或非rw()函数内修改Hold()装饰器装饰的对象！\n尝试修改的对象：',
                holder,
                '\n尝试修改的属性或索引：',
                key
            );
        }

        return false;
    }

    return true;
}

export function lockWriteForRootHolder(rootHolder: any): void {
    isUnlockingState = false;

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
    isUnlockingState = true;

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
