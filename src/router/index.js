import { createRouter, createWebHistory } from "vue-router";

import PasienView from "../views/PasienView.vue";
import CreateStokView from "../views/CreateStokView.vue";
import MasterObatView from "../views/MasterObatView.vue";
import MasterGolonganView from "../views/MasterGolonganView.vue";
import DispensingView from "../views/DispensingView.vue";
import StokKeluarView from "../views/StokKeluarView.vue";
import TransferStokView from "../views/TransferStokView.vue";
import RekapView from "../views/RekapView.vue";
import StockLogView from "../views/StockLogView.vue";
import ReportsView from "../views/ReportsView.vue";
import LoginApotekerView from "../views/LoginApotekerView.vue";
import { isApotekerLoggedIn } from "../utils/apotekerAuth";

const routes = [
  { path: "/", redirect: "/dispensing" },
  {
    path: "/login",
    name: "login-apoteker",
    component: LoginApotekerView,
    meta: { public: true },
  },
  { path: "/pasien", name: "pasien", component: PasienView },
  { path: "/create/stok-obat", name: "stok-obat", component: CreateStokView },
  { path: "/rekap-stok", name: "rekap-stok", component: RekapView },
  { path: "/master/obat", name: "master-obat", component: MasterObatView },
  { path: "/master/golongan", name: "master-golongan", component: MasterGolonganView },
  { path: "/penerimaan", redirect: "/create/stok-obat" },
  { path: "/dispensing", name: "dispensing", component: DispensingView },
  { path: "/stok-transfer", name: "stok-transfer", component: TransferStokView },
  { path: "/stok-keluar", name: "stok-keluar", component: StokKeluarView },
  { path: "/stock-log", name: "stock-log", component: StockLogView },
  { path: "/reports", name: "reports", component: ReportsView },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const isPublicRoute = Boolean(to.meta.public);
  const loggedIn = isApotekerLoggedIn();

  if (!isPublicRoute && !loggedIn) {
    return {
      path: "/login",
      query: {
        redirect: to.fullPath,
      },
    };
  }

  if (isPublicRoute && loggedIn) {
    return {
      path: "/dispensing",
    };
  }

  return true;
});
