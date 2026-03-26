import {createRouter, createWebHistory} from "vue-router"

import PasienView from "../views/PasienView.vue"

const routes =[
    { path: '/', redirect: '/pasien' },
    { path: '/pasien', name: 'pasien', component: PasienView }
]

export const router = createRouter({
    history: createWebHistory(),
    routes,
})

