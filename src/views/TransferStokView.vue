<template>
  <div class="transfer-stok-view">
    <div class="form-container">
      <h2>Transfer Stok</h2>

      <div class="transfer-fields">
        <select v-model="selectedRekapId">
          <option value="" disabled>Pilih Obat dari Rekap</option>
          <option v-for="item in rekapOptions" :key="item.key" :value="item.key">
            {{ item.nama_obat }} - {{ item.nama_golongan_obat }} - {{ item.nama_bentuk_obat }} - {{ item.dosis }} {{ item.satuan_dosis }}
          </option>
        </select>
        <select v-model="direction">
          <option value="gudang_ke_apotek">Gudang ke Apotek</option>
          <option value="apotek_ke_gudang">Apotek ke Gudang</option>
        </select>
        <input type="number" v-model.number="transferJumlah" placeholder="Jumlah Transfer" />
        <button type="button" @click="submitTransfer">Transfer</button>
        <button type="button" @click="fetchJumlahStok">Refresh Jumlah</button>
      </div>

      <p v-if="transferMessage" class="ok-msg">{{ transferMessage }}</p>
      <p v-if="transferError" class="error-msg">{{ transferError }}</p>

      <div v-if="stokSummary" class="summary-box">
        <p>Total: {{ stokSummary.total }}</p>
        <p>Gudang: {{ stokSummary.gudang }}</p>
        <p>Apotek: {{ stokSummary.apotek }}</p>
      </div>

      <div v-if="selectedRekap" class="summary-box">
        <p><strong>Obat:</strong> {{ selectedRekap.nama_obat }}</p>
        <p><strong>Golongan:</strong> {{ selectedRekap.nama_golongan_obat }}</p>
        <p><strong>Bentuk:</strong> {{ selectedRekap.nama_bentuk_obat }}</p>
        <p><strong>Dosis:</strong> {{ selectedRekap.dosis }} {{ selectedRekap.satuan_dosis }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";

const selectedRekapId = ref("");
const transferJumlah = ref(0);
const transferMessage = ref("");
const transferError = ref("");
const stokSummary = ref(null);
const rekapOptions = ref([]);
const direction = ref("gudang_ke_apotek");

const selectedRekap = computed(() => rekapOptions.value.find((item) => item.key === selectedRekapId.value) || null);

const fetchRekapOptions = async () => {
  try {
    const res = await fetch("/api/stok/rekap");
    const data = await res.json();
    rekapOptions.value = (data.data || []).map((item) => ({
      ...item,
      key: String(item.produk_obat_id || item.obat_id),
    }));
  } catch (err) {
    rekapOptions.value = [];
  }
};

const fetchJumlahStok = async () => {
  if (!selectedRekap.value?.produk_obat_id) {
    stokSummary.value = null;
    return;
  }

  try {
    const res = await fetch(`/api/stok/jumlah?produk_obat_id=${encodeURIComponent(selectedRekap.value.produk_obat_id)}`);
    const data = await res.json();
    stokSummary.value = data?.data?.summary || null;
  } catch (err) {
    stokSummary.value = null;
  }
};

const submitTransfer = async () => {
  try {
    transferError.value = "";
    transferMessage.value = "";

    if (!selectedRekap.value?.produk_obat_id) {
      transferError.value = "Pilih obat dari rekap dulu";
      return;
    }

    const sourceLocation = direction.value === "gudang_ke_apotek" ? "Gudang" : "Apotek";
    const targetLocation = direction.value === "gudang_ke_apotek" ? "Apotek" : "Gudang";

    const payload = {
      produk_obat_id: Number(selectedRekap.value.produk_obat_id),
      obat_id: Number(selectedRekap.value.obat_id),
      golongan_obat_id: Number(selectedRekap.value.golongan_obat_id) || null,
      jumlah_obat: Number(transferJumlah.value),
      dari_lokasi_nama: sourceLocation,
      ke_lokasi_nama: targetLocation,
    };

    const res = await fetch("/api/stok/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      transferError.value = data.message || "Gagal transfer stok";
      return;
    }

    transferMessage.value = data.message || "Transfer stok berhasil";
    await fetchJumlahStok();
  } catch (err) {
    transferError.value = "Terjadi kesalahan saat transfer stok";
  }
};

watch(selectedRekapId, () => {
  transferMessage.value = "";
  transferError.value = "";
  transferJumlah.value = 0;
  fetchJumlahStok();
});

onMounted(fetchRekapOptions);
</script>

<style scoped>
.transfer-stok-view {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background: #f7f8fa;
  padding: 40px 0;
}

.form-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08);
  padding: 40px 36px 32px 36px;
  width: 95vw;
  max-width: 700px;
  margin: 32px auto;
}

.form-container h2 {
  margin-bottom: 24px;
  font-size: 1.5rem;
  color: #2d3748;
  text-align: center;
}

.transfer-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.transfer-fields input,
.transfer-fields select,
.transfer-fields button {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  background: #f9fafb;
}

.transfer-fields button {
  color: #1f2937;
  font-weight: 600;
}

.transfer-fields button:first-of-type {
  background: #2f855a;
  border-color: #2f855a;
  color: #ffffff;
}

.transfer-fields button:last-of-type {
  background: #e5e7eb;
  border-color: #cbd5e1;
  color: #1f2937;
}

.summary-box {
  margin-top: 12px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #f9fafb;
}

.ok-msg {
  color: #1a7f37;
}

.error-msg {
  color: #b00020;
}
</style>
