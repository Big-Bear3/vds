import { VdsKeys } from './../core/constants';
import { cloneDeep } from 'lodash';
import { getRawObjectInfo } from '../core/mapping';
import { attachDebugInfoToObject, cloneDeepForSnapshot, isDebugMode } from '../core/utils';
import { reactive, toRaw } from '@vue/reactivity';

interface RootSnapshotAttachedInfo {
    snapshotRootHolder: any;
    getSnapshotFn: (...args: any[]) => any;
    getSnapshotFnArgs: any[];
}

interface SnapshotInfo {
    position: (string | symbol | number)[];
}

const rawRootSnapshotToRootSnapshotAttachedInfo = new WeakMap<any, any>();

const rawSnapshotToSnapshotInfo = new WeakMap<any, any>();

export function handleSnapshot(descriptor: PropertyDescriptor): void {
    let hostType: 'method' | 'accessor';
    if (descriptor.value) {
        hostType = 'method';
    } else if (descriptor.get) {
        hostType = 'accessor';
    } else {
        console.error('Snapshot()装饰器只能装饰方法和get访问器！');
        return;
    }

    let originFn: (...args: any[]) => any;
    if (hostType === 'method') {
        originFn = descriptor.value;
        descriptor.value = function (...args: any[]) {
            return handleSnapshotFn(originFn, args, this);
        };
    } else if (hostType === 'accessor') {
        originFn = descriptor.get;
        descriptor.get = function (...args: any[]) {
            return handleSnapshotFn(originFn, args, this);
        };
    }
}

function handleSnapshotFn(originFn: (...args: any[]) => any, originFnArgs: any[], snapshotRootHolder: any): any {
    const reactiveSensitiveSnapshot = originFn.call(snapshotRootHolder, ...originFnArgs);
    if (typeof reactiveSensitiveSnapshot !== 'object' || reactiveSensitiveSnapshot === null) {
        console.error('快照必须是非空的Object类型！');
        return undefined;
    }

    const rawRootSnapshot = cloneDeepForSnapshot(reactiveSensitiveSnapshot, (sensitiveObj, rawSnapshot) => {
        const rawObjectInfo = getRawObjectInfo(toRaw(sensitiveObj));
        if (!rawObjectInfo) return;

        const snapshotInfo: SnapshotInfo = { position: cloneDeep(rawObjectInfo.position) };
        rawSnapshotToSnapshotInfo.set(rawSnapshot, snapshotInfo);

        if (isDebugMode()) attachDebugInfoToObject(rawSnapshot, VdsKeys.SnapshotInfo, snapshotInfo);
    });

    const rootSnapshotAttachedInfo: RootSnapshotAttachedInfo = {
        snapshotRootHolder,
        getSnapshotFn: originFn,
        getSnapshotFnArgs: originFnArgs
    };

    rawRootSnapshotToRootSnapshotAttachedInfo.set(rawRootSnapshot, rootSnapshotAttachedInfo);

    if (isDebugMode()) attachDebugInfoToObject(rawRootSnapshot, VdsKeys.RootSnapshotAttachedInfo, rootSnapshotAttachedInfo);

    return reactive(rawRootSnapshot);
}

export function getSnapshotInfo(rawSnapshot: any): SnapshotInfo {
    return rawSnapshotToSnapshotInfo.get(rawSnapshot);
}

export function getRootSnapshotAttachedInfo(rawRootSnapshot: any): RootSnapshotAttachedInfo {
    return rawRootSnapshotToRootSnapshotAttachedInfo.get(rawRootSnapshot);
}
