<script setup>
import { ref } from 'vue'
const openMenu = ref(null)
function toggleMenu(menu) {
    openMenu.value = openMenu.value === menu ? null : menu
}
</script>

<template>
    <aside class="sidebar">
        <ul class="menu-list">
            <li class="menu-item">
                <button type="button" @click="toggleMenu('far')" class="menu-trigger">
                    <span>Farmasi</span>
                    <font-awesome-icon :icon="openMenu === 'far' ? 'chevron-down' : 'chevron-right'" class="icon" />
                </button>
                <ul v-if="openMenu === 'far'" class="submenu">
                    <li><router-link to="/pasien">Pasien</router-link></li>
                    <li>Stok</li>
                </ul>
            </li>
        </ul>
    </aside>
</template>

<style scoped>
.sidebar {
    --sidebar-width: 220px;
    --header-height: 64px;
    background-color: #4CAF50;
    width: var(--sidebar-width);
    height: calc(100svh - var(--header-height));
    position: fixed;
    top: var(--header-height);
    left: 0;
    z-index: 1000;
    padding: 14px 0;
    box-sizing: border-box;
}

.menu-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.menu-item {
    list-style: none;
}

.menu-trigger {
    width: 100%;
    border: 0;
    background: transparent;
    color: inherit;
    padding: 12px 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    text-align: left;
}

.icon {
    margin-left: auto;
}

.menu-trigger:hover {
    background-color: #ddd;
}

.submenu {
    list-style: none;
    padding: 0;
    margin: 0;
}

.submenu li {
    padding: 12px 18px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.submenu li:hover {
    background-color: #ddd;
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

