<template>
  <div class="dispensing-view">
    <h2>Dispensing by Nomor Registrasi</h2>

    <div class="form-grid">
      <input v-model="noRegistrasi" placeholder="Nomor Registrasi (contoh: REG-001)" />
      <select v-model.number="apotekerId">
        <option :value="null" disabled>Pilih Apoteker</option>
        <option v-for="a in apotekers" :key="a.id" :value="a.id">{{ a.nama_apoteker }}</option>
      </select>
      <button type="button" @click="fetchByNoReg">Cari</button>
      <button type="button" @click="processDispensing">Proses Dispensing</button>
    </div>

    <div class="queue-card">
      <h3>Antrian Dispensing</h3>
      <div class="queue-actions">
        <input v-model="queueSearch" placeholder="Cari no reg / nama pasien" />
        <button type="button" @click="fetchQueue">Refresh</button>
      </div>
      <table v-if="queueRows.length > 0" class="table queue-table">
        <thead>
          <tr>
            <th>No Registrasi</th>
            <th>Pasien</th>
            <th>Total</th>
            <th>Sudah</th>
            <th>Pending</th>
            <th>Stok Keluar</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in queueRows" :key="row.no_registrasi">
            <td>{{ row.no_registrasi }}</td>
            <td>{{ row.nama_pasien }}</td>
            <td>{{ row.total_item }}</td>
            <td>{{ row.sudah }}</td>
            <td>{{ row.pending }}</td>
            <td>{{ row.stok_keluar_done }}</td>
            <td><button type="button" @click="selectFromQueue(row)">Pilih</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="message" class="ok-msg">{{ message }}</p>
    <p v-if="error" class="error-msg">{{ error }}</p>

    <div v-if="pasienData" class="card">
      <p><strong>No Reg:</strong> {{ pasienData.no_registrasi }}</p>
      <p><strong>Pasien:</strong> {{ pasienData.pasien?.nama_pasien || '-' }}</p>
    </div>

    <table v-if="details.length > 0" class="table">
      <thead>
        <tr>
          <th>Obat</th>
          <th>Jumlah Resep</th>
          <th>Stok Apotek</th>
          <th>Tersedia</th>
          <th>Status Dispensing</th>
          <th>Stok Keluar</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in details" :key="d.detail_resep_id">
          <td>{{ d.nama_obat }}</td>
          <td>{{ d.jumlah_resep }}</td>
          <td>{{ d.stok_apotek }}</td>
          <td>{{ d.tersedia ? 'Ya' : 'Tidak' }}</td>
          <td>{{ d.status_dispensing }}</td>
          <td>{{ d.is_stok_keluar ? 'Sudah' : 'Belum' }}</td>
        </tr>
      </tbody>
    </table>

    <button
      v-if="pasienData"
      type="button"
      class="next-btn"
      @click="goToStokKeluar"
    >
      Lanjut ke Stok Keluar
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const noRegistrasi = ref("");
const apotekerId = ref(null);
const apotekers = ref([]);
const pasienData = ref(null);
const details = ref([]);
const message = ref("");
const error = ref("");
const queueRows = ref([]);
const queueSearch = ref("");

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
    const res = await fetch(`/api/dispensing/by-no-reg/${encodeURIComponent(noRegistrasi.value)}`);
    const data = await res.json();

    if (!res.ok || data.success === false) {
      error.value = data.message || "Data tidak ditemukan";
      pasienData.value = null;
      details.value = [];
      return;
    }

    pasienData.value = data.data;
    details.value = data.data.details || [];
  } catch (err) {
    error.value = "Terjadi kesalahan saat mengambil data";
    pasienData.value = null;
    details.value = [];
  }
};

const processDispensing = async () => {
  try {
    error.value = "";
    message.value = "";

    const payload = {
      no_registrasi: noRegistrasi.value,
      apoteker_id: Number(apotekerId.value),
    };

    const res = await fetch("/api/dispensing/process-by-no-reg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-idempotency-key": createIdempotencyKey(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      error.value = data.message || "Gagal proses dispensing";
      return;
    }

    message.value = "Dispensing berhasil diproses. Obat tersedia ditandai Sudah, sisanya Pending.";
    await fetchByNoReg();
    await fetchQueue();
  } catch (err) {
    error.value = "Terjadi kesalahan saat proses dispensing";
  }
};

const fetchQueue = async () => {
  try {
    const query = queueSearch.value ? `?q=${encodeURIComponent(queueSearch.value)}` : "";
    const res = await fetch(`/api/dispensing/queue${query}`);
    const data = await res.json();
    queueRows.value = data.data || [];
  } catch (err) {
    queueRows.value = [];
  }
};

const selectFromQueue = async (row) => {
  noRegistrasi.value = row.no_registrasi;
  await fetchByNoReg();
};

const goToStokKeluar = () => {
  router.push({
    path: "/stok-keluar",
    query: {
      no_registrasi: noRegistrasi.value,
      apoteker_id: apotekerId.value || "",
    },
  });
};

onMounted(async () => {
  await fetchApotekers();
  await fetchQueue();
});
</script>

<style scoped>
.dispensing-view {
  padding: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr auto auto;
  gap: 8px;
  margin-bottom: 12px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.card {
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.queue-card {
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.queue-actions {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  margin-bottom: 8px;
}

.queue-table {
  margin-top: 8px;
}

.ok-msg { color: #1a7f37; }
.error-msg { color: #b00020; }
.next-btn { margin-top: 12px; }
</style>
