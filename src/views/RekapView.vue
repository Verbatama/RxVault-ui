<script setup>
import { onMounted, ref } from "vue";
import { apiUrl } from "../utils/api";

const rekapStok = ref([]);
const loading = ref(false);
const error = ref("");
const minStokDefault = ref(20);
const reminderRows = ref([]);
const reminderLoading = ref(false);
const reminderError = ref("");

const formatTanggal = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getLevelClass = (level) => {
  const current = String(level || "").toUpperCase();
  if (current === "HABIS") {
    return "badge-habis";
  }
  if (current === "KRITIS") {
    return "badge-kritis";
  }
  return "badge-waspada";
};

const fetchRekapStok = async () => {
  try {
    loading.value = true;
    error.value = "";
    const res = await fetch(apiUrl("/api/stok/rekap"));
    const data = await res.json();
    rekapStok.value = data.data || [];
  } catch (err) {
    error.value = "Gagal mengambil rekap stok obat";
    rekapStok.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchReminderGudang = async () => {
  try {
    reminderLoading.value = true;
    reminderError.value = "";

    const defaultMin = Number(minStokDefault.value);
    const params = new URLSearchParams({
      default_min_stok:
        Number.isFinite(defaultMin) && defaultMin > 0
          ? String(Math.floor(defaultMin))
          : "20",
    });

    const res = await fetch(apiUrl(`/api/stok/reminder?${params.toString()}`));
    const data = await res.json();

    if (!res.ok || data.success === false) {
      reminderRows.value = [];
      reminderError.value = data.message || "Gagal mengambil reminder stok gudang";
      return;
    }

    reminderRows.value = data.data?.reminders || [];
  } catch (err) {
    reminderRows.value = [];
    reminderError.value = "Gagal mengambil reminder stok gudang";
  } finally {
    reminderLoading.value = false;
  }
};

const refreshAll = async () => {
  await Promise.all([fetchRekapStok(), fetchReminderGudang()]);
};

onMounted(refreshAll);
</script>

<template>
  <div class="rekap-view">
    <div class="card">
      <div class="header-row">
        <h2>Rekap Stok Obat</h2>
        <button type="button" @click="refreshAll">Refresh</button>
      </div>

      <div class="reminder-card">
        <div class="header-row">
          <h3>Reminder Stok Gudang Menipis</h3>
          <div class="reminder-actions">
            <label for="defaultMinStokInput">Default Min</label>
            <input
              id="defaultMinStokInput"
              v-model.number="minStokDefault"
              type="number"
              min="1"
            />
            <button type="button" @click="fetchReminderGudang">Cek Reminder</button>
          </div>
        </div>

        <p v-if="reminderLoading">Memuat reminder stok gudang...</p>
        <p v-if="reminderError" class="error">{{ reminderError }}</p>

        <table v-if="!reminderLoading && reminderRows.length > 0" class="rekap-table">
          <thead>
            <tr>
              <th>Level</th>
              <th>Nama Obat</th>
              <th>Brand</th>
              <th>Bentuk</th>
              <th>Dosis</th>
              <th>Stok Gudang</th>
              <th>Min Gudang</th>
              
              <th>Batch Exp</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in reminderRows" :key="row.produk_obat_id">
              <td>
                <span class="badge" :class="getLevelClass(row.level)">{{ row.level }}</span>
              </td>
              <td>{{ row.nama_obat }}</td>
              <td>{{ row.brand }}</td>
              <td>{{ row.bentuk_obat }}</td>
              <td>{{ row.dosis }} {{ row.satuan_dosis }}</td>
              <td>{{ row.stok_gudang }}</td>
              <td>{{ row.min_stok_gudang }}</td>
              
              <td>{{ formatTanggal(row.earliest_expired_date) }}</td>
            </tr>
          </tbody>
        </table>

        <p v-if="!reminderLoading && reminderRows.length === 0 && !reminderError" class="ok-text">
          Tidak ada stok gudang yang menipis.
        </p>
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
            <th>Min Gudang</th>
            <th>Stok Apotek</th>
            <th>EXP</th>
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
            <td>{{ row.min_stok_gudang }}</td>
            <td>{{ row.stok_apotek }}</td>
            <td>{{ row.earliest_expired_date ? formatTanggal(row.earliest_expired_date) : '-' }}</td>
          </tr>
          <tr v-if="!loading && rekapStok.length === 0">
            <td colspan="9">Belum ada data stok</td>
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

.reminder-card {
  margin-bottom: 18px;
  border: 1px solid #dbeafe;
  border-radius: 10px;
  padding: 14px;
  background: #f8fbff;
}

.reminder-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reminder-actions input {
  width: 90px;
  padding: 7px 8px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;
  padding: 4px 8px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 12px;
}

.badge-habis {
  background: #fee2e2;
  color: #991b1b;
}

.badge-kritis {
  background: #ffedd5;
  color: #9a3412;
}

.badge-waspada {
  background: #fef9c3;
  color: #854d0e;
}

.ok-text {
  color: #166534;
  font-weight: 600;
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