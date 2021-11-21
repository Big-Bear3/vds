import { rw } from '@/vds/core/rw';
import { VdsKeys } from './../core/constants';
import { cloneDeep } from 'lodash';
import { getRawObjectInfo } from '../core/mapping';
import { attachDebugInfoToObject, cloneDeepViaLodashClone, isCollectionObject, isDebugMode } from '../core/utils';
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

export function Snapshot(): MethodDecorator {
    return function (_target: any, _key: string | any, descriptor: PropertyDescriptor) {
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
    };
}

export function handleSnapshotFn(originFn: (...args: any[]) => any, originFnArgs: any[], snapshotRootHolder: any): any {
    const reactiveSensitiveSnapshot = originFn.call(snapshotRootHolder, ...originFnArgs);
    const sensitiveSnapshotType = typeof reactiveSensitiveSnapshot;
    if (sensitiveSnapshotType !== 'object' || sensitiveSnapshotType === null) {
        console.error('快照必须是对象类型！');
        return undefined;
    }

    const rawRootSnapshot = cloneDeepViaLodashClone(reactiveSensitiveSnapshot, (sensitiveObj, rawSnapshot) => {
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

export function commitSnapshot(reactiveRootSnapshot: any): void {
    const rawRootSnapshot = toRaw(reactiveRootSnapshot);
    const rootSnapshotAttachedInfo = getRootSnapshotAttachedInfo(rawRootSnapshot);
    if (!rootSnapshotAttachedInfo) {
        console.error('提交的对象不是一个有效的快照！', rawRootSnapshot);
        return;
    }
    commitSnapshotItem(rawRootSnapshot, rootSnapshotAttachedInfo.snapshotRootHolder);
}

function commitSnapshotItem(rawSnapshot: any, snapshotRootHolder: any): void {
    const snapshotIsObject = typeof rawSnapshot === 'object';
    const currentSnapshotPosition = getSnapshotInfo(rawSnapshot)?.position;
    if (snapshotIsObject && currentSnapshotPosition) {
        rw(snapshotRootHolder, () => {
            settleSnapshotItem(rawSnapshot, currentSnapshotPosition, snapshotRootHolder);
        });
        return;
    }
    if (Array.isArray(rawSnapshot)) {
        for (let i = 0; i < rawSnapshot.length; i++) {
            commitSnapshotItem(rawSnapshot[i], snapshotRootHolder);
        }
    } else if (snapshotIsObject) {
        for (const key of Object.keys(rawSnapshot)) {
            commitSnapshotItem(rawSnapshot[key], snapshotRootHolder);
        }
    }
}

function settleSnapshotItem(rawSnapshot: any, snapshotPosition: (string | symbol | number)[], snapshotRootHolder: any): void {
    let targetReactiveObj = snapshotRootHolder;
    let previousReactiveObj: any;
    for (let i = 0; i < snapshotPosition.length; i++) {
        previousReactiveObj = targetReactiveObj;
        targetReactiveObj = targetReactiveObj[snapshotPosition[i]];
        if (!targetReactiveObj) {
            console.warn(
                '快照要回传的位置节点丢失，已跳过该节点！位置节点对象',
                cloneDeep(previousReactiveObj),
                '，key：',
                snapshotPosition[i].toString()
            );
            return;
        }
    }

    const rawSnapshotCopy = cloneDeep(rawSnapshot);
    if (Array.isArray(targetReactiveObj) && Array.isArray(rawSnapshot)) {
        targetReactiveObj.splice(0, targetReactiveObj.length, ...rawSnapshotCopy);
    } else if (!isCollectionObject(rawSnapshot) && !isCollectionObject(rawSnapshot)) {
        for (const targetReactiveObjKey of Object.keys(targetReactiveObj)) {
            delete targetReactiveObj[targetReactiveObjKey];
        }
        for (const rawSnapshotCopyKey of Object.keys(rawSnapshotCopy)) {
            targetReactiveObj[rawSnapshotCopyKey] = rawSnapshotCopy[rawSnapshotCopyKey];
        }
    } else {
        previousReactiveObj[snapshotPosition[snapshotPosition.length - 1]] = rawSnapshotCopy;
    }
}
