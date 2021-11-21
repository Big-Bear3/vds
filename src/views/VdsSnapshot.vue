<template>
    <ul class="vds-snapshot-ul">
        <li>{{ animals }}</li>
        <li>
            <input v-model="animalsSnapshot.dog" />
        </li>
        <li>
            <input v-model="animalsSnapshot.cat.cat1" />
        </li>
        <li>
            <input v-model="animalsSnapshot.cat.cat2" />
        </li>
        <li v-for="(pig, index) in animalsSnapshot.pigs" :key="index">
            <input v-model="animalsSnapshot.pigs[index]" />
        </li>
        <li>
            <button @click="commit">提交</button>
        </li>
    </ul>
    <ul class="vds-snapshot-ul">
        <li>{{ animals2.myAnimal }}</li>
        <li>
            <input v-model="animalsCombinationSnapshot.cat1.cat1" />
        </li>
        <li>
            <input v-model="animalsCombinationSnapshot.cat1.cat2" />
        </li>
        <li v-for="(pig2, index) in animalsCombinationSnapshot.pigs2" :key="index">
            <input v-model="animalsCombinationSnapshot.pigs2[index]" />
        </li>
        <li>
            <button @click="commit2">提交</button>
        </li>
    </ul>
</template>

<script lang="ts" setup>
import { testStoreForSnapshot } from '@/vds-stores/stores';
import { Vds } from '@/vds/vds';

const { animals, animals2, animalsSnapshot, animalsCombinationSnapshot } = testStoreForSnapshot;

const commit = (): void => {
    Vds.commit(animalsSnapshot);
};

const commit2 = (): void => {
    Vds.commit(animalsCombinationSnapshot);
    console.log(testStoreForSnapshot);
};
</script>
