import { testOtherStore1ForCore, testOtherStore2ForCore } from './stores';
import { Hold } from '@/vds/core/hold';
import { rw, Rw } from '@/vds/core/rw';
import { Vds } from '@/vds/vds';

export class TestParentStoreForCore {
    @Hold()
    shallowAnimals = {
        dog: 'Dog',
        cat: 'Cat',
        pigs: ['Pig1', 'Pig2', 'Pig3']
    };
}

export class TestOtherStoreForCore {
    @Hold()
    zoo = {
        bear: { bear1: 'Bear1', bear2: 'Bear2' },
        panda: ['Panda1', 'Panda2', 'Panda3']
    };
}

export class TestStoreForCore extends TestParentStoreForCore {
    // =======================shallow object============================

    @Rw()
    setShallowDog(): void {
        this.shallowAnimals.dog = 'Dog!!!!';
    }

    @Rw()
    async removeShallowCat() {
        setTimeout(() => {
            rw(this, () => {
                delete this.shallowAnimals.cat;
            });
        });
    }

    @Rw()
    pushShallowPig(): void {
        this.shallowAnimals.pigs.push('Pig4');
    }

    @Rw()
    removeShallowPig(): void {
        this.shallowAnimals.pigs.splice(this.shallowAnimals.pigs.length - 1);
    }

    // ========================shallow array===========================
    @Hold()
    shallowDucksArray = ['Duck1', 'Duck2', 'Duck3'];

    @Rw()
    insertDuck(): void {
        this.shallowDucksArray.splice(1, 0, 'Duck!!!!');
    }

    @Rw()
    setThirdDuck(): void {
        this.shallowDucksArray[2] = '@Duck';
    }

    // ========================deep object===========================
    @Hold()
    deepAnimals: any = {
        redAnimals: {
            monkey: 'Monkey',
            fish: {
                carp: 'Carp'
            }
        },
        yellowAnimals: ['Lion', { camel: 'Camel' }]
    };

    @Rw()
    setMonkey(): void {
        this.deepAnimals.redAnimals.monkey = 'Monkey####';
    }

    @Rw()
    addFish(): void {
        this.deepAnimals.redAnimals.fish.betta = 'Betta';
    }

    @Rw()
    setCarp(): void {
        this.deepAnimals.redAnimals.fish.carp = 'Carp。。';
    }

    lionIndex = 0;

    @Rw()
    setLion(): void {
        this.deepAnimals.yellowAnimals[0] = 'Lion^^^^' + this.lionIndex;
        this.lionIndex++;
    }

    @Rw()
    setCamel(): void {
        this.deepAnimals.yellowAnimals[1].camel = 'Camel++';
    }

    // ========================deep array===========================
    @Hold()
    deepMarineAnimalsArray = [{ dolphin: ['Dolphin1', 'Dolphin2'] }, { dolphin: ['DolphinA', 'DolphinB', 'DolphinC'] }];

    get firstDolphins() {
        return this.deepMarineAnimalsArray[0];
    }

    getSecondDolphins() {
        return this.deepMarineAnimalsArray[1].dolphin;
    }

    @Rw()
    setFirstDolphin(): void {
        this.deepMarineAnimalsArray[0].dolphin = ['Dolphin3'];
        setTimeout(() => {
            rw(this, () => {
                this.deepMarineAnimalsArray[0].dolphin = ['Dolphin4'];
            });
        }, 1000);
        setTimeout(() => {
            rw(this, () => {
                this.deepMarineAnimalsArray[0].dolphin.push('Dolphin5');
            });
        }, 2000);
    }

    @Rw()
    changeSecondDolphin(index: number): void {
        this.deepMarineAnimalsArray[1].dolphin[index] = 'Dolphin~~~';
    }

    @Rw()
    changeSecondDolphins(index1: number, index2: number): void {
        this.deepMarineAnimalsArray[1].dolphin[index1] = 'Dolphin---';
        this.deepMarineAnimalsArray[1].dolphin[index2] = 'Dolphin===';
    }

    @Rw()
    changeSecondDolphins2(...index: number[]): void {
        for (const indexItem of index) {
            this.deepMarineAnimalsArray[1].dolphin[indexItem] = '...Dolphin';
        }
    }

    @Rw()
    changeSecondDolphinsArray(indexArray: number[]): void {
        for (const indexItem of indexArray) {
            this.deepMarineAnimalsArray[1].dolphin[indexItem] = 'Dolphin[][]';
        }
    }

    // ========================动态数据===========================
    @Hold()
    dynamicDeepAnimals: any = { tiger: { tigerColor: { yellowTiger: 'YellowTiger' } } };

    private dynamicDeepAnimals2 = { tiger: { tigerColor: { whiteTiger: 'WhiteTiger' } } };

    @Rw()
    toggleTiger(): void {
        setTimeout(() => {
            rw(this, () => {
                this.dynamicDeepAnimals = this.dynamicDeepAnimals2;
            });
        });
    }

    @Hold()
    dynamicDeepAnimalsArray: any = [{ rabit: 'Rabit' }, { mouse: 'Mouse' }];

    private dynamicDeepAnimalsArray2: any = [{ cow: 'Cow' }];

    @Rw()
    toggleDeepAnimalsArray(): void {
        this.dynamicDeepAnimalsArray = this.dynamicDeepAnimalsArray2;
    }

    @Rw()
    toggleTiger2(): void {
        this.dynamicDeepAnimalsArray = this.dynamicDeepAnimals2;
    }

    // ========================代理===========================

    get zoo1() {
        return testOtherStore1ForCore.zoo;
    }

    get zoo2() {
        return testOtherStore2ForCore.zoo;
    }

    constructor() {
        super();
        Vds.asAgent(this, testOtherStore1ForCore);
    }

    @Rw()
    changeZoo1(): void {
        this.zoo1.bear.bear1 = 'Bear1!!!!';
    }

    @Rw()
    changeZoo2(): void {
        this.zoo2.bear.bear1 = 'Bear1!!!!';
    }
}
