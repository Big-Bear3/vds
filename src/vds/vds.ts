import { handleHold } from './core/hold';
import { addAgent } from './core/mapping';
import { lockWriteForRootHolder, unlockWriteForRootHolder } from './core/rw';
import { commitSnapshot } from './snapshot/commit';
import { handleSnapshot } from './snapshot/snapshot';

export function Hold(): PropertyDecorator {
    const rootHolderToRootObj = new WeakMap<any, any>();
    return function (target: any, key: string | symbol) {
        handleHold(target, key, rootHolderToRootObj);
    };
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

export function rw(rootHolder: any, rwAble: () => void): void {
    unlockWriteForRootHolder(rootHolder);
    rwAble();
    lockWriteForRootHolder(rootHolder);
}

export function Snapshot(): MethodDecorator {
    return function (_target: any, _key: string | any, descriptor: PropertyDescriptor) {
        handleSnapshot(descriptor);
    };
}

export class Vds {
    static commit(snapshot: any): void {
        commitSnapshot(snapshot);
    }

    static asAgent(rootHolderAsAgent: any, ...targetRootHolders: any[]): void {
        if (!targetRootHolders) return;
        for (const targetRootHolder of targetRootHolders) {
            addAgent(targetRootHolder, rootHolderAsAgent);
        }
    }
}
