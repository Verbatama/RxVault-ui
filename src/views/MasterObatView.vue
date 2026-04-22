<template>
  <div class="master-obat page-view">
    <div class="page-card">
    <h2>Master Data - Obat</h2>
    <form @submit.prevent="createObat" class="master-form">
      <input v-model="nama_obat" placeholder="Nama Obat" required />
      <select v-model.number="selectedGolongan" required>
        <option :value="null" disabled>Pilih Golongan</option>
        <option v-for="g in golongans" :key="g.id" :value="g.id">
          {{ g.nama_golongan_obat }}
        </option>
      </select>
      <button type="submit">Create</button>
    </form>

    <hr />
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <table class="table">
      <thead>
        <tr>
          <th>Nama Obat</th>
          <th>Golongan</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in obats" :key="o.id">
          <td>{{ o.nama_obat }}</td>
          <td>{{ o.golonganObat?.nama_golongan_obat || '-' }}</td>
        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiUrl } from '../utils/api'

const obats = ref([])
const golongans = ref([])
const nama_obat = ref('')
const selectedGolongan = ref(null)
const errorMessage = ref('')

const fetchObats = async () => {
  try {
    const res = await fetch(apiUrl('/api/obat'))
    const data = await res.json()
    obats.value = data.data || []
  } catch (e) {
    errorMessage.value = 'Gagal mengambil data obat'
  }
}

const fetchGolongan = async () => {
  try {
    const res = await fetch(apiUrl('/api/golongan-obat'))
    const data = await res.json()
    golongans.value = data.data || []
  } catch (e) {
    errorMessage.value = 'Gagal mengambil data golongan obat'
  }
}

onMounted(async () => {
  await Promise.all([fetchObats(), fetchGolongan()])
})

const createObat = async () => {
  try {
    errorMessage.value = ''
    if (!selectedGolongan.value) {
      errorMessage.value = 'Golongan obat wajib dipilih'
      return
    }

    const payload = { nama_obat: nama_obat.value, golongan_obat_id: selectedGolongan.value }
    const res = await fetch(apiUrl('/api/obat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const result = await res.json()
    if (!res.ok || result.success === false) {
      errorMessage.value = result.message || 'Gagal membuat obat'
      return
    }

    nama_obat.value = ''
    selectedGolongan.value = null
    await fetchObats()
  } catch (e) {
    errorMessage.value = 'Terjadi kesalahan saat membuat obat'
  }
}
</script>

<style scoped>
.master-form {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

hr {
  border: none;
  border-top: 1px solid #e7edf4;
  margin: 14px 0;
}

.error {
  margin-bottom: 12px;
}

@media (max-width: 720px) {
  .master-form {
    flex-direction: column;
  }
}
</style>
