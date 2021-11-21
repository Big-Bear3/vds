<template>
    <ul class="vds-core-ul">
        <li>======================================shallow object=========================================</li>
        <br />
        <li>
            <span>shallowDog：</span>
            <input v-model="shallowAnimals.dog" />
            <button class="event-btn" @click="testStoreForCore.setShallowDog">Change Dog</button>
        </li>
        <li>
            <span>shallowCat：</span>
            <input v-model="shallowAnimals.cat" />
            <button class="event-btn" @click="testStoreForCore.removeShallowCat">Remove Cat</button>
        </li>
        <li>
            <span>shallowPigs：</span>
            <input v-for="(shallowPig, index) in shallowPigs" :key="index" v-model="shallowPigs[index]" style="width: 70px" />
            <button class="event-btn" @click="testStoreForCore.pushShallowPig">Push Pig</button>
            <button class="event-btn" @click="testStoreForCore.removeShallowPig">Remove Pig</button>
        </li>
        <br />
        <li>======================================shallow array=========================================</li>
        <br />
        <li>
            <span>shallowDucksArray：</span>
            <input
                v-for="(shallowDuck, index) in shallowDucksArray"
                :key="index"
                v-model="shallowDucksArray[index]"
                style="width: 70px"
            />
            <button class="event-btn" @click="testStoreForCore.insertDuck">Insert Duck</button>
            <button class="event-btn" @click="testStoreForCore.setThirdDuck">Change Third Duck</button>
        </li>
        <br />
        <li>======================================deep object=========================================</li>
        <br />
        <li>
            <span>deepMonkey：</span>
            <input v-model="deepAnimals.redAnimals.monkey" />
            <button class="event-btn" @click="testStoreForCore.setMonkey">Change Monkey</button>
        </li>
        <li>
            <span>deepFish：</span>
            <span>{{ fishes }}</span>
            <button class="event-btn" @click="testStoreForCore.addFish">Add Fish</button>
            <button class="event-btn" @click="testStoreForCore.setCarp">Change Carp</button>
        </li>
        <li>
            <span>deepLion（shallow watch）：</span>
            <input v-model="deepLionShallowWatch" />
            <button class="event-btn" @click="testStoreForCore.setLion">Change Lion</button>
        </li>
        <li>
            <span>deepLion（deep watch）：</span>
            <input v-model="deepLionDeepWatch" />
            <button class="event-btn" @click="testStoreForCore.setLion">Change Lion</button>
        </li>
        <li>
            <span>deepLion（effect watch）：</span>
            <input v-model="deepLionEffectWatch" />
            <button class="event-btn" @click="testStoreForCore.setLion">Change Lion</button>
        </li>
        <li>
            <span>deepCamel：</span>
            <input v-model="deepCamel.camel" />
            <button class="event-btn" @click="testStoreForCore.setCamel">Change Camel</button>
        </li>
        <br />
        <li>======================================deep array=========================================</li>
        <br />
        <li>
            <span>deepFirstDolphins：</span>
            <input
                v-for="(dolphin, index) in firstDolphins.dolphin"
                :key="index"
                v-model="firstDolphins.dolphin[index]"
                style="width: 70px"
            />
            <button class="event-btn" @click="testStoreForCore.setFirstDolphin">Change First Dolphins</button>
        </li>
        <li>
            <span>deepSecondDolphins：</span>
            <input v-for="(dolphin, index) in secondDolphins" :key="index" v-model="secondDolphins[index]" style="width: 70px" />
            <button class="event-btn" @click="testStoreForCore.changeSecondDolphin(1)">Change Second Dolphin</button>
            <button class="event-btn" @click="testStoreForCore.changeSecondDolphins(0, 2)">Change Second Dolphins</button>
            <button class="event-btn" @click="testStoreForCore.changeSecondDolphins2(0, 1, 2)">Change Second Dolphins2</button>
            <button class="event-btn" @click="testStoreForCore.changeSecondDolphinsArray([1, 2])">
                Change Second Dolphins Array
            </button>
        </li>
        <br />
        <li>======================================动态数据=========================================</li>
        <br />
        <li>
            <span>dynamicTiger：</span>
            <span>{{ testStoreForCore.dynamicDeepAnimals }}</span>
            <button class="event-btn" @click="testStoreForCore.toggleTiger">Toggle Tiger</button>
        </li>
        <li>
            <span>dynamicAnimalsArray：</span>
            <div>{{ testStoreForCore.dynamicDeepAnimalsArray }}</div>
            <div>{{ testStoreForCoreReactive.dynamicDeepAnimalsArray }}</div>
            <button class="event-btn" @click="testStoreForCore.toggleDeepAnimalsArray">Toggle Animals Array</button>
            <button class="event-btn" @click="testStoreForCore.toggleTiger2">Toggle Tiger2 Log Error</button>
        </li>
        <br />
        <li>======================================代理=========================================</li>
        <br />
        <li>
            <span>zoo1：</span>
            <div>{{ testStoreForCore.zoo1 }}</div>
            <div>{{ testStoreForCore.zoo2 }}</div>
            <button class="event-btn" @click="testStoreForCore.changeZoo1">Change Zoo1</button>
            <button class="event-btn" @click="testStoreForCore.changeZoo2">Change Zoo2 Log Error</button>
        </li>
    </ul>
    <!-- <button @click="commit">提交</button> -->
</template>

<script lang="ts" setup>
import { testStoreForCore } from '@/vds-stores/stores';
import { computed, ref, reactive, watch, watchEffect } from 'vue';
const testStoreForCoreReactive = reactive(testStoreForCore);
const { shallowAnimals, shallowDucksArray, deepAnimals, firstDolphins, dynamicDeepAnimals } = testStoreForCore;
const shallowPigs = shallowAnimals.pigs;

const fishes = computed(() => {
    const fishesObj = deepAnimals.redAnimals.fish;
    const fishesArray = [];
    for (const key of Object.keys(fishesObj)) {
        fishesArray.push(fishesObj[key]);
    }
    return fishesArray;
});

const deepLionShallowWatch = ref();
watch(
    () => deepAnimals.yellowAnimals[0],
    () => {
        deepLionShallowWatch.value = deepAnimals.yellowAnimals[0];
    },
    { immediate: true }
);

const deepLionDeepWatch = ref();
watch(
    () => deepAnimals,
    () => {
        deepLionDeepWatch.value = deepAnimals.yellowAnimals[0];
    },
    { immediate: true, deep: true }
);

const deepLionEffectWatch = ref();
watchEffect(() => {
    deepLionEffectWatch.value = deepAnimals.yellowAnimals[0];
});

const deepCamel = deepAnimals.yellowAnimals[1];

const secondDolphins = testStoreForCore.getSecondDolphins();
</script>
<style lang="less">
.vds-core-ul {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    .event-btn {
        margin-left: 10px;
    }
}
</style>
