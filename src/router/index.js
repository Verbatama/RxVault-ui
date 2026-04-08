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

const routes = [
  { path: "/", redirect: "/pasien" },
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
