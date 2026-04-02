<template>
  <div class="reports page-view">
    <div class="page-card">
    <h2>Daily Usage Report</h2>
    <label>Report Date: <input type="date" v-model="date" /></label>
    <button @click="fetchReport">Get Report</button>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div v-if="summary" class="summary-grid">
      <div class="card">
        <div class="label">Pasien Mengambil Obat</div>
        <div class="value">{{ summary.pasien_mengambil_obat }}</div>
      </div>
      <div class="card">
        <div class="label">Gudang ke Apotek</div>
        <div class="value">{{ summary.gudang_ke_apotek }}</div>
      </div>
      <div class="card">
        <div class="label">Apotek Kembali ke Gudang</div>
        <div class="value">{{ summary.apotek_kembali_ke_gudang }}</div>
      </div>
      <div class="card">
        <div class="label">Ambil dari Gudang (Khusus)</div>
        <div class="value">{{ summary.ambil_dari_gudang_khusus }}</div>
      </div>
    </div>

    <table v-if="report.length" class="table">
      <thead>
        <tr>
          <th>Obat</th>
          <th>Pasien Mengambil</th>
          <th>Gudang ke Apotek</th>
          <th>Apotek ke Gudang</th>
          <th>Ambil Gudang Khusus</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in report" :key="r.obat_id">
          <td>{{ r.nama_obat }}</td>
          <td>{{ r.pasien_mengambil_obat }}</td>
          <td>{{ r.gudang_ke_apotek }}</td>
          <td>{{ r.apotek_kembali_ke_gudang }}</td>
          <td>{{ r.ambil_dari_gudang_khusus }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="empty">Tidak ada data untuk tanggal ini.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const date = ref(new Date().toISOString().slice(0,10))
const report = ref([])
const summary = ref(null)
const errorMessage = ref('')

const fetchReport = async () => {
  try {
    errorMessage.value = ''
    const res = await fetch(`/api/reports/daily?date=${date.value}`)
    const data = await res.json()
    if (!res.ok || data.success === false) {
      errorMessage.value = data.message || 'Gagal mengambil laporan harian'
      report.value = []
      summary.value = null
      return
    }

    report.value = data?.data?.rows || []
    summary.value = data?.data?.summary || {
      pasien_mengambil_obat: 0,
      gudang_ke_apotek: 0,
      apotek_kembali_ke_gudang: 0,
      ambil_dari_gudang_khusus: 0,
    }
  } catch (e) {
    errorMessage.value = 'Terjadi kesalahan saat mengambil laporan harian'
    report.value = []
    summary.value = null
  }
}

fetchReport()
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 10px;
  margin: 14px 0;
}
.card {
  padding: 12px;
}
.label { font-size: 12px; color: #666 }
.value { font-size: 20px; font-weight: 700 }
.empty { color: #666; margin-top: 10px }

@media (max-width: 980px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}

@media (max-width: 580px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
