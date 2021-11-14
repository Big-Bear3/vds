<template>
    <ul>
        <li>
            <span>用户名：</span>
            <input v-model="user[0].userName" />
        </li>
    </ul>
    <!-- <button @click="commit">提交</button> -->
</template>

<script lang="ts" setup>
import { MyStore } from '@/vds-stores/myStore';

const store = new MyStore();
const user = store.userData;

const details = user[0].details[0];
console.log(details);
</script>
