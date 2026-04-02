<template>
  <div class="penerimaan">
    <h2>Penerimaan Obat (Receiving)</h2>
    <form @submit.prevent="submitReceive">
      <input v-model="obatSearch" placeholder="Search obat..." @input="handleSearch" />
      <ul v-if="results.length">
        <li v-for="r in results" :key="r.id" @click="selectObat(r)">{{ r.nama_obat }}</li>
      </ul>

      <div v-if="selectedObat">
        <p>Selected: {{ selectedObat.nama_obat }}</p>
        <input v-model="brand" placeholder="Brand" />
        <input v-model="dosis" placeholder="Dosis" />
        <input v-model="nomor_batch" placeholder="Nomor Batch" />
        <input type="number" v-model.number="jumlah" placeholder="Jumlah" />
        <input v-model="tanggal_kadaluarsa" placeholder="Tanggal Kadaluarsa (YYYY-MM-DD)" />
        <button type="submit">Submit Penerimaan</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const obatSearch = ref('')
const results = ref([])
const allObat = ref([])
const selectedObat = ref(null)

const brand = ref('')
const dosis = ref('')
const nomor_batch = ref('')
const jumlah = ref(0)
const tanggal_kadaluarsa = ref('')

onMounted(async () => {
  try {
    const res = await fetch('/api/obat')
    const data = await res.json()
    allObat.value = data.data || []
  } catch (e) { console.error(e) }
})

const handleSearch = () => {
  const q = obatSearch.value.toLowerCase()
  results.value = allObat.value.filter(o => o.nama_obat && o.nama_obat.toLowerCase().includes(q))
}

const selectObat = (o) => { selectedObat.value = o; results.value = []; obatSearch.value = o.nama_obat }

const submitReceive = async () => {
  if (!selectedObat.value) return alert('Pilih obat dulu')
  const payload = {
    obat_id: selectedObat.value.id,
    brand: brand.value,
    bentuk_obat_id: selectedObat.value.bentuk_obat_id || null,
    dosis: dosis.value,
    DetailStoks: [
      { nomor_batch: nomor_batch.value, jumlah_obat: jumlah.value, tanggal_kadaluarsa: tanggal_kadaluarsa.value }
    ]
  }
  try {
    const res = await fetch('/api/penerimaan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()
    console.log(data)
    alert('Penerimaan disimpan')
  } catch (e) { console.error(e); alert('Gagal') }
}
</script>

<style scoped>
.penerimaan { padding: 20px }
ul { list-style:none; padding:0; margin:6px 0 }
li { cursor:pointer; padding:4px }
</style>
