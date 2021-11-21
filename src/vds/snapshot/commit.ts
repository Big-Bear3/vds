import { cloneDeep } from 'lodash';
import { toRaw } from 'vue';
import { rw } from '../core/rw';
import { tryToSetValueToContent } from '../core/utils';
import { getRootSnapshotAttachedInfo, getSnapshotInfo } from './snapshot';

export function commitSnapshot(reactiveRootSnapshot: any): void {
    const rawRootSnapshot = toRaw(reactiveRootSnapshot);
    const rootSnapshotAttachedInfo = getRootSnapshotAttachedInfo(rawRootSnapshot);
    if (!rootSnapshotAttachedInfo) {
        console.error('提交的对象不是一个有效的快照！\n', rawRootSnapshot);
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
                '快照要回传的位置节点丢失，已跳过该节点！\n位置节点对象：\n',
                cloneDeep(previousReactiveObj),
                '\nkey：',
                snapshotPosition[i].toString()
            );
            return;
        }
    }

    const rawSnapshotCopy = cloneDeep(rawSnapshot);
    const successful = tryToSetValueToContent(rawSnapshotCopy, targetReactiveObj);
    if (!successful) {
        console.error(
            '提交快照失败，快照值必须和原值同类型！\n快照值：\n',
            rawSnapshotCopy,
            '\n原值：\n',
            cloneDeep(targetReactiveObj)
        );
    }
}
