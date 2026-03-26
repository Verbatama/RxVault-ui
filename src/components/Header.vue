<template>
  <header class="header">
    <div class="container">
      <h1 class="logo">RxVault</h1>

      <nav>
        <ul class="nav-list">
          <li>Profile</li>
          <li>Logout</li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>

.header {
  --header-height: 64px;
  background-color:#4CAF50;
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1100;
  height: var(--header-height);
  padding: 0 20px;
  font-size: 14px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  border: 1px solid #ddd;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logo {
  font-size: 20px;
  margin: 0;
}

.nav-list {
  list-style: none;
  display: flex;
  gap: 12px;
  margin: 0;
  padding: 0;
}

.nav-list li {
  cursor: pointer;
  opacity: 0.8;
  transition: 0.2s;
}

.nav-list li:hover {
  opacity: 1;
}

@media (max-width: 900px) {
  .header {
    padding: 0 14px;
  }
}
</style>

<script setup>
</script>