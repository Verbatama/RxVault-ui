<template>
  <header class="header">
    <div class="container">
      <h1 class="logo">RxVault</h1>

      <nav>
        <ul class="nav-list">
          <li><button type="button">Profile</button></li>
          <li><button type="button">Logout</button></li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style scoped>

.header {
  --header-height: 64px;
  background: linear-gradient(135deg, #2f855a 0%, #276749 100%);
  color: #fff;
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
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 10px 24px rgba(24, 39, 28, 0.24);
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logo {
  font-size: 22px;
  letter-spacing: 0.4px;
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
  list-style: none;
}

.nav-list button {
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  padding: 6px 12px;
  border-radius: 999px;
  box-shadow: none;
}

.nav-list button:hover {
  background: rgba(255, 255, 255, 0.24);
}

@media (max-width: 900px) {
  .header {
    padding: 0 14px;
  }
}
</style>

<script setup></script>
