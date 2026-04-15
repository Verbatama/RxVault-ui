<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import "./style.css";
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";

const route = useRoute();
const isLoginPage = computed(() => route.path === "/login");
</script>

<template>
  <div class="app-shell">
    <template v-if="!isLoginPage">
      <Header />
      <Sidebar />
      <main class="content">
        <router-view />
      </main>
    </template>

    <main v-else class="auth-content">
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

.auth-content {
  min-height: 100svh;
}

@media (max-width: 900px) {
  .content {
    margin-left: 0;
  }
}
</style>
