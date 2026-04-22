<script setup>
import { ref, onMounted } from "vue";
import { getApotekerAuthHeader } from "../utils/apotekerAuth";
import { apiUrl } from "../utils/api";

const searchQuery = ref("");
const pasien = ref(null);
const loading = ref(false);
const error = ref("");

const statusDispensingOptions = ref([]);
const updatingAll = ref(false);

// Cari pasien
const cariPasien = async () => {
  const query = searchQuery.value.trim();
  if (!query) return;

  loading.value = true;
  error.value = "";
  pasien.value = null;

  try {
    const res = await fetch(apiUrl(`/api/pasien/no_reg/${encodeURIComponent(query)}`));
    const result = await res.json();

    if (!result.success) {
      error.value = result.message || "Pasien tidak ditemukan";
    } else {
      pasien.value = result.data;
    }
  } catch (err) {
    console.error(err);
    error.value = "Terjadi kesalahan saat fetch data";
  } finally {
    loading.value = false;
  }
};

// Reset pencarian
const resetSearch = () => {
  searchQuery.value = "";
  pasien.value = null;
  error.value = "";
};

// Format tanggal lokal
const formatTanggal = (tgl) => {
  if (!tgl) return "-";
  return new Date(tgl).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

// Ambil opsi status dispensing
onMounted(async () => {
  try {
    const res = await fetch(apiUrl("/api/status-dispensing"));
    const result = await res.json();
    statusDispensingOptions.value = (result.data || []).map((s) => ({
      value: s.id,
      label: s.nama_status,
    }));
  } catch (err) {
    console.error("Gagal fetch status dispensing", err);
  }
});

// util post status (dipakai per-baris & massal)
const postStatusDispensing = async (detail) => {
  const res = await fetch(apiUrl("/api/dispensing"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getApotekerAuthHeader(),
    },
    body: JSON.stringify({
      detail_resep_id: detail.id,
      status_dispensing_id: Number(detail.selectedStatus),
      dispensingAt: new Date(),
    }),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.message || "Gagal update");
  detail.dispensing = detail.dispensing || [];
  detail.dispensing.push(result.data);
};

// Update per-baris
const updateStatusDispensing = async (detail) => {
  if (!detail.selectedStatus) return;
  try {
    await postStatusDispensing(detail);
    alert("Status dispensing berhasil diupdate!");
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan saat update status: " + err.message);
  }
};

// // Update massal
// const updateAllStatus = async () => {
//   const details = (pasien.value?.reseps || [])
//     .flatMap((r) => r.detailReseps || [])
//     .filter((d) => d.selectedStatus);

//   if (!details.length) {
//     alert("Pilih status terlebih dahulu untuk minimal satu obat.");
//     return;
//   }

//   updatingAll.value = true;
//   try {
//     await Promise.all(details.map((d) => postStatusDispensing(d)));
//     alert("Semua status dispensing berhasil diupdate!");
//   } catch (err) {
//     console.error(err);
//     alert("Sebagian/gagal update: " + err.message);
//   } finally {
//     updatingAll.value = false;
//   }
// };

// Status terbaru
const getLatestStatus = (detail) => {
  const lastDisp = detail.dispensing?.[detail.dispensing.length - 1];
  return lastDisp?.status?.nama_status || "Belum diupdate";
};
</script>

<template>
  <div class="pasien-view page-view">
    <div class="page-card">
      <form @submit.prevent="cariPasien" class="search-form">
        <input type="search" placeholder="Cari no reg pasien" v-model="searchQuery" />
        <button type="submit">Cari</button>
        <button type="button" @click="resetSearch">Reset</button>
      </form>

      <div v-if="loading">Loading...</div>
      <div v-else-if="error" class="error">{{ error }}</div>

      <div v-else-if="pasien">
        <h3>Data Pasien</h3>
        <table class="table">
      <thead>
        <tr>
          <th>No Reg</th>
          <th>Kode Reg</th>
          <th>No Antrian</th>
          <th>Tanggal Kunjungan</th>
          <th>Nama</th>
          <th>Umur</th>
          <th>Jenis Kelamin</th>
          <th>Alamat</th>
          <th>No RM</th>
          <th>Tanggal Lahir</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ pasien.no_registrasi }}</td>
          <td>{{ pasien.kode_registrasi }}</td>
          <td>{{ pasien.no_antrian }}</td>
          <td>{{ formatTanggal(pasien.tanggal_kunjungan) }}</td>
          <td>{{ pasien.pasien?.nama_pasien }}</td>
          <td>{{ pasien.pasien?.umur }}</td>
          <td>{{ pasien.pasien?.jenis_kelamin }}</td>
          <td>{{ pasien.pasien?.alamat }}</td>
          <td>{{ pasien.pasien?.no_rekam_medis }}</td>
          <td>{{ formatTanggal(pasien.pasien?.tanggal_lahir) }}</td>
        </tr>
      </tbody>
    </table>

      <h3>Resep Obat</h3>

   

        <table class="table">
      <thead>
        <tr>
          <th>Nama Obat</th>
          <th>Dosis</th>
          <th>Aturan Pakai</th>
          <th>Jumlah</th>
          <th>Status Dispensing</th>
          <th>Status Saat Ini</th>
          <th>Aksi</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(resep, i) in pasien.reseps || []" :key="i">
          <tr v-for="(detail, j) in resep.detailReseps || []" :key="j">
            <td>{{ detail.obat.nama_obat }}</td>
            <td>{{ detail.obat.dosis }}</td>
            <td>{{ detail.aturan_pakai }}</td>
            <td>{{ detail.jumlah }}</td>
            <td>
              <select v-model="detail.selectedStatus">
                <option value="">-- Pilih Status --</option>
                <option
                  v-for="status in statusDispensingOptions"
                  :key="status.value"
                  :value="status.value"
                >
                  {{ status.label }}
                </option>
              </select>
            </td>
            <td>{{ getLatestStatus(detail) }}</td>
            <td>
              <button
                @click="updateStatusDispensing(detail)"
                :disabled="!detail.selectedStatus || updatingAll"
              >
                Update Status
              </button>
            </td>
          </tr>
        </template>
      </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Form */
.search-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.search-form input {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #d4d4d8;
  border-radius: 6px;
}
.search-form button {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #2f855a;
  color: #fff;
  transition: background 0.2s ease;
}
.search-form button[type="button"] {
  background: #5b6473;
}
.search-form button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  color: #b00020;
  font-weight: 600;
}

/* Bulk action */
.bulk-action {
  margin: 0.5rem 0 0.75rem;
}
.bulk-action button {
  padding: 9px 14px;
  background: #2f855a;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.bulk-action button:disabled {
  background: #a3a3a3;
  cursor: not-allowed;
}

/* Table */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
.table th {
  background: #2f855a;
  color: white;
  text-align: left;
  padding: 10px;
  font-weight: 600;
}
.table td {
  padding: 10px;
  color: #333;
}
.table th,
.table td {
  border-bottom: 1px solid #eee;
}
.table tbody tr:nth-child(even) {
  background: #f9fafb;
}
.table tbody tr:hover {
  background: #f2f8f5;
  transition: 0.2s;
}
.table select,
.table button {
  font-size: 13px;
}
.table select {
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #d4d4d8;
  min-width: 150px;
}
.table button {
  padding: 7px 10px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.table button:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}
</style>