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
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "about" */ '../views/VdsSnapshot.vue')
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
