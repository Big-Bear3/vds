import { addAgent } from './core/mapping';
import { commitSnapshot } from './snapshot/commit';

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
