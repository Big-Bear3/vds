import { commitSnapshot } from './snapshot/snapshot';

export class Vds {
    static commit(snapshot: any): void {
        commitSnapshot(snapshot);
    }
}
