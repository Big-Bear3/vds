import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import VdsCore from '../views/VdsCore.vue';

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'VdsCore',
        component: VdsCore
    },
    {
        path: '/vds-snapshot',
        name: 'Snapshot',
        component: () => import('../views/VdsSnapshot.vue')
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
