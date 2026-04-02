<script setup>
import { ref } from "vue";
const openMenu = ref(null);
function toggleMenu(menu) {
  openMenu.value = openMenu.value === menu ? null : menu;
}
</script>

<template>
  <aside class="sidebar">
    <ul class="menu-list">
      <li class="menu-item">
        <button type="button" v-on:click="toggleMenu('far')" class="menu-trigger">
          <span>Farmasi</span>
          <font-awesome-icon :icon="openMenu === 'far' ? 'chevron-down' : 'chevron-right'" class="icon" />
        </button>
        <ul v-if="openMenu === 'far'" class="submenu">
          <li><router-link to="/pasien">Pasien</router-link></li>
          <li><router-link to="/master/obat">Master Obat</router-link></li>
          <li><router-link to="/master/golongan">Master Golongan</router-link></li>
          <li><router-link to="/dispensing">Dispensing</router-link></li>
          <li><router-link to="/reports">Reports</router-link></li>
        </ul>
      </li>
      <li class="menu-item">
        <button type="button" v-on:click="toggleMenu('stok')" class="menu-trigger">
          <span>Stok</span>
          <font-awesome-icon :icon="openMenu === 'stok' ? 'chevron-down' : 'chevron-right'" class="icon" />
        </button>
        <ul v-if="openMenu === 'stok'" class="submenu">
          <li><router-link to="/create/stok-obat">Pengadaan Baru</router-link></li>
          <li><router-link to="/rekap-stok">Rekap Stok Obat</router-link></li>
          <li><router-link to="/stok-transfer">Transfer Stok</router-link></li>
          <li><router-link to="/stok-keluar">Stok Keluar</router-link></li>
          <li><router-link to="/stock-log">Stock Log</router-link></li>
        </ul>
      </li>

    </ul>
  </aside>
</template>

<style scoped>
.sidebar {
  --sidebar-width: 220px;
  --header-height: 64px;
  background: linear-gradient(180deg, #1f4a33 0%, #1c3f2d 100%);
  color: #eff8f2;
  width: var(--sidebar-width);
  height: calc(100svh - var(--header-height));
  position: fixed;
  top: var(--header-height);
  left: 0;
  z-index: 1000;
  padding: 14px 10px;
  box-sizing: border-box;
  box-shadow: inset -1px 0 0 rgba(255, 255, 255, 0.1), 10px 0 24px rgba(14, 22, 16, 0.18);
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  list-style: none;
  margin-bottom: 6px;
}

.menu-trigger {
  width: 100%;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  padding: 11px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  text-align: left;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.icon {
  margin-left: auto;
}

.menu-trigger:hover {
  background-color: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
}

.submenu {
  list-style: none;
  padding: 4px;
  margin: 4px 0 0;
}

.submenu li {
  border-radius: 8px;
  margin-bottom: 4px;
}

.submenu a {
  display: block;
  width: 100%;
  color: #e9f7ee;
  text-decoration: none;
  padding: 10px 10px;
  border-radius: 8px;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.submenu a:hover {
  background-color: rgba(255, 255, 255, 0.14);
  transform: translateX(2px);
}

.submenu a.router-link-active {
  background: rgba(207, 243, 222, 0.2);
  border: 1px solid rgba(190, 234, 208, 0.32);
}

@media (max-width: 900px) {
  .sidebar {
    position: static;
    width: 100%;
    height: auto;
    padding: 12px 0;
  }

  .menu-list {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
  }

  .menu-item {
    flex: 1 1 50%;
    box-sizing: border-box;
  }

  .submenu {
    width: 100%;
  }
}
</style>
