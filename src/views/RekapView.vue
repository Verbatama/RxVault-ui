<script setup>
import { onMounted, ref } from "vue";

const rekapStok = ref([]);
const loading = ref(false);
const error = ref("");

const fetchRekapStok = async () => {
  try {
    loading.value = true;
    error.value = "";
    const res = await fetch("/api/stok/rekap");
    const data = await res.json();
    rekapStok.value = data.data || [];
  } catch (err) {
    error.value = "Gagal mengambil rekap stok obat";
    rekapStok.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRekapStok);
</script>

<template>
  <div class="rekap-view">
    <div class="card">
      <div class="header-row">
        <h2>Rekap Stok Obat</h2>
        <button type="button" @click="fetchRekapStok">Refresh</button>
      </div>

      <p v-if="loading">Memuat data rekap...</p>
      <p v-if="error" class="error">{{ error }}</p>

      <table class="rekap-table">
        <thead>
          <tr>
            <th>Nama Obat</th>
            <th>Golongan</th>
            <th>Bentuk</th>
            <th>Dosis</th>
            <th>Satuan</th>
            <th>Stok Keseluruhan</th>
            <th>Stok Gudang</th>
            <th>Stok Apotek</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rekapStok" :key="`${row.obat_id}-${row.golongan_obat_id}-${row.bentuk_obat_id}-${row.dosis}-${row.satuan_dosis_id || row.satuan_dosis}`">
            <td>{{ row.nama_obat }}</td>
            <td>{{ row.nama_golongan_obat }}</td>
            <td>{{ row.nama_bentuk_obat }}</td>
            <td>{{ row.dosis }}</td>
            <td>{{ row.satuan_dosis }}</td>
            <td>{{ row.stok_total }}</td>
            <td>{{ row.stok_gudang }}</td>
            <td>{{ row.stok_apotek }}</td>
          </tr>
          <tr v-if="!loading && rekapStok.length === 0">
            <td colspan="8">Belum ada data stok</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.rekap-view {
  padding: 20px;
}

.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  padding: 24px;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.header-row button {
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}

.rekap-table {
  width: 100%;
  border-collapse: collapse;
}

.rekap-table th,
.rekap-table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}

.rekap-table th {
  background: #f3f4f6;
}

.error {
  color: #b00020;
}
</style>