import { Hold, Snapshot } from '@/vds/vds';

export class TestParentStoreForSnapshot {}

export class TestStoreForSnapshot extends TestParentStoreForSnapshot {
    // =======================shallow object============================
    @Hold()
    private _animals = {
        dog: 'Dog',
        cat: { cat1: 'Cat1', cat2: 'Cat2' },
        pigs: ['Pig1', 'Pig2', 'Pig3']
    };

    @Hold()
    private _animals2 = {
        myAnimal: {
            dog: 'Dog!!',
            cat: { cat1: 'Cat1!!', cat2: 'Cat2!!' },
            pigs: ['Pig1!!', 'Pig2!!', 'Pig3!!']
        }
    };

    @Snapshot()
    get animalsSnapshot() {
        return this._animals;
    }

    @Snapshot()
    get animalsCombinationSnapshot() {
        return { cat1: this._animals.cat, pigs2: this._animals2.myAnimal.pigs };
    }

    get animals() {
        return this._animals;
    }

    get animals2() {
        return this._animals2;
    }

    constructor() {
        super();
        // setTimeout(() => {
        //     rw(this, () => {
        //         delete this._animals.cat;
        //     });
        // }, 1000);
    }
}
