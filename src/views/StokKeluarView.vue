<template>
  <div class="stok-keluar-view">
    <h2>Stok Keluar by Nomor Registrasi</h2>

    <div class="form-grid">
      <input v-model="noRegistrasi" placeholder="Nomor Registrasi" />
      <select v-model.number="apotekerId">
        <option :value="null" disabled>Pilih Apoteker</option>
        <option v-for="a in apotekers" :key="a.id" :value="a.id">{{ a.nama_apoteker }}</option>
      </select>
      <button type="button" @click="fetchByNoReg">Refresh Data</button>
      <button type="button" @click="processStokKeluar">Proses Stok Keluar</button>
    </div>

    <p v-if="message" class="ok-msg">{{ message }}</p>
    <p v-if="error" class="error-msg">{{ error }}</p>

    <table v-if="details.length > 0" class="table">
      <thead>
        <tr>
          <th>Obat</th>
          <th>Jumlah Resep</th>
          <th>Status Dispensing</th>
          <th>Stok Keluar</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in details" :key="d.detail_resep_id">
          <td>{{ d.nama_obat }}</td>
          <td>{{ d.jumlah_resep }}</td>
          <td>{{ d.status_dispensing }}</td>
          <td>{{ d.is_stok_keluar ? 'Sudah' : 'Belum' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const noRegistrasi = ref(route.query.no_registrasi || "");
const apotekerId = ref(route.query.apoteker_id ? Number(route.query.apoteker_id) : null);
const apotekers = ref([]);
const details = ref([]);
const message = ref("");
const error = ref("");

const createIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const fetchApotekers = async () => {
  try {
    const res = await fetch("/api/apoteker");
    const data = await res.json();
    apotekers.value = data.data || [];
  } catch (err) {
    apotekers.value = [];
  }
};

const fetchByNoReg = async () => {
  try {
    error.value = "";
    message.value = "";
    if (!noRegistrasi.value) {
      details.value = [];
      return;
    }
    const res = await fetch(`/api/dispensing/by-no-reg/${encodeURIComponent(noRegistrasi.value)}`);
    const data = await res.json();
    if (!res.ok || data.success === false) {
      error.value = data.message || "Data tidak ditemukan";
      details.value = [];
      return;
    }
    details.value = data?.data?.details || [];
  } catch (err) {
    error.value = "Terjadi kesalahan saat mengambil data";
    details.value = [];
  }
};

const processStokKeluar = async () => {
  try {
    error.value = "";
    message.value = "";

    const payload = {
      no_registrasi: noRegistrasi.value,
      apoteker_id: Number(apotekerId.value),
    };

    const res = await fetch("/api/stok-keluar/by-no-reg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-idempotency-key": createIdempotencyKey(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      error.value = data.message || "Gagal proses stok keluar";
      return;
    }

    const okCount = data?.data?.processed?.length || 0;
    const failCount = data?.data?.failed?.length || 0;
    message.value = `Proses stok keluar selesai. Berhasil: ${okCount}, gagal: ${failCount}`;
    await fetchByNoReg();
  } catch (err) {
    error.value = "Terjadi kesalahan saat proses stok keluar";
  }
};

onMounted(async () => {
  await fetchApotekers();
  await fetchByNoReg();
});
</script>

<style scoped>
.stok-keluar-view { padding: 20px; }
.form-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr auto auto;
  gap: 8px;
  margin-bottom: 12px;
}
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
.ok-msg { color: #1a7f37; }
.error-msg { color: #b00020; }
</style>
