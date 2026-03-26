<script setup>
import "./style.css";
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue';
</script>

<template>
    <Header />
    <Sidebar />
    <main class="content">
        <router-view/>
    </main>
</template>

<style scoped>
.content {
    --header-height: 64px;
    --sidebar-width: 220px;
    margin-top: var(--header-height);
    margin-left: var(--sidebar-width);
    padding: 16px;
    min-height: calc(100svh - var(--header-height));
    box-sizing: border-box;
}

@media (max-width: 900px) {
    .content {
        margin-left: 0;
    }
}
</style>
