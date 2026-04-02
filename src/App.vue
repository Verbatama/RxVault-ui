<script setup>
import "./style.css";
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
</script>

<template>
  <div class="app-shell">
    <Header />
    <Sidebar />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.content {
  --header-height: 64px;
  --sidebar-width: 220px;
  margin-top: var(--header-height);
  margin-left: var(--sidebar-width);
  padding: 22px;
  min-height: calc(100svh - var(--header-height));
  box-sizing: border-box;
}

@media (max-width: 900px) {
  .content {
    margin-left: 0;
  }
}
</style>
