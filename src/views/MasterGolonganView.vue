<template>
  <div class="master-golongan page-view">
    <div class="page-card">
    <h2>Master Data - Golongan Obat</h2>

    <div class="toolbar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search golongan obat"
        @input="goToFirstPage"
      />
      <button type="button" @click="showCreateForm = !showCreateForm">
        {{ showCreateForm ? 'Tutup Form' : 'Create Golongan Baru' }}
      </button>
    </div>

    <form v-if="showCreateForm" class="create-form" @submit.prevent="createGolongan">
      <input
        v-model.trim="nama_golongan_obat"
        placeholder="Nama Golongan"
        required
      />
      <button type="submit">Simpan</button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <table class="table">
      <thead>
        <tr>
          <th>No</th>
          <th>Nama Golongan Obat</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(g, index) in paginatedGolongans" :key="g.id">
          <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
          <td>{{ g.nama_golongan_obat }}</td>
        </tr>
        <tr v-if="paginatedGolongans.length === 0">
          <td colspan="2">Data tidak ditemukan</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button type="button" :disabled="currentPage === 1" @click="currentPage--">
        Prev
      </button>
      <span>Page {{ currentPage }} / {{ totalPages }}</span>
      <button type="button" :disabled="currentPage === totalPages" @click="currentPage++">
        Next
      </button>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { apiUrl } from '../utils/api'

const golongans = ref([])
const nama_golongan_obat = ref('')
const searchQuery = ref('')
const errorMessage = ref('')
const showCreateForm = ref(false)
const currentPage = ref(1)
const pageSize = 10

const filteredGolongans = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return golongans.value
  return golongans.value.filter((item) =>
    item.nama_golongan_obat?.toLowerCase().includes(q)
  )
})

const totalPages = computed(() => {
  const pages = Math.ceil(filteredGolongans.value.length / pageSize)
  return pages > 0 ? pages : 1
})

const paginatedGolongans = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredGolongans.value.slice(start, end)
})

const goToFirstPage = () => {
  currentPage.value = 1
}

const fetchGolongan = async () => {
  try {
    const res = await fetch(apiUrl('/api/golongan-obat'))
    const data = await res.json()
    golongans.value = data.data || []
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value
    }
  } catch (e) {
    errorMessage.value = 'Gagal mengambil data golongan obat'
  }
}

onMounted(fetchGolongan)

const createGolongan = async () => {
  try {
    errorMessage.value = ''
    const res = await fetch(apiUrl('/api/golongan-obat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama_golongan_obat: nama_golongan_obat.value })
    })
    const result = await res.json()

    if (!res.ok || result.success === false) {
      errorMessage.value = result.message || 'Gagal membuat golongan obat'
      return
    }

    nama_golongan_obat.value = ''
    showCreateForm.value = false
    await fetchGolongan()
    goToFirstPage()
  } catch (e) {
    errorMessage.value = 'Terjadi kesalahan saat membuat golongan obat'
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px
}

.create-form {
  display: flex;
  gap: 8px;
  margin-bottom: 12px
}

input,
button {
  padding: 8px
}

.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px
}

.error {
  margin: 8px 0
}

@media (max-width: 720px) {
  .toolbar,
  .create-form {
    flex-direction: column;
  }
}
</style>
