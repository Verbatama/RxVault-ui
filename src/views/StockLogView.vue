<template>
  <div class="stock-log page-view">
    <div class="page-card">
    <h2>Stock Log</h2>

    <div class="filters">
      <select v-model="selectedYear" @change="fetchLog">
        <option value="">Semua Tahun</option>
        <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
      </select>

      <select v-model="selectedMonth" @change="fetchLog">
        <option value="">Semua Bulan</option>
        <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>

      <select v-model="selectedDay" @change="fetchLog">
        <option value="">Semua Tanggal</option>
        <option v-for="d in dayOptions" :key="d" :value="d">{{ d }}</option>
      </select>

      <button @click="fetchLog">Refresh</button>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Obat</th>
          <th>Jumlah</th>
          <th>Dari</th>
          <th>Ke</th>
          <th>Keterangan</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="entry in logs" :key="entry.id">
          <td>{{ formatDate(entry.tanggal_mutasi) }}</td>
          <td>{{ entry.nama_obat }}</td>
          <td>{{ entry.jumlah_obat }}</td>
          <td>{{ entry.dari_lokasi }}</td>
          <td>{{ entry.ke_lokasi }}</td>
          <td>{{ entry.keterangan }}</td>
        </tr>
        <tr v-if="logs.length === 0">
          <td colspan="6">Data stock log tidak ditemukan</td>
        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const logs = ref([])
const selectedYear = ref('')
const selectedMonth = ref('')
const selectedDay = ref('')

const now = new Date()
const currentYear = now.getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)
const dayOptions = Array.from({ length: 31 }, (_, i) => i + 1)
const monthOptions = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
]

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID')
}

const fetchLog = async () => {
  try {
    const params = new URLSearchParams()
    if (selectedYear.value) params.set('year', selectedYear.value)
    if (selectedMonth.value) params.set('month', selectedMonth.value)
    if (selectedDay.value) params.set('day', selectedDay.value)
    const query = params.toString()

    const res = await fetch(`/api/stock-log${query ? `?${query}` : ''}`)
    const data = await res.json()
    logs.value = data.data || []
  } catch (e) { console.error(e) }
}

onMounted(fetchLog)
</script>

<style scoped>
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.filters select {
  max-width: 200px;
}
</style>
