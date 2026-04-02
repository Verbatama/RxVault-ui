<script setup>
import { ref, watch, onMounted } from "vue";

const searchQueryObat = ref("");
const loading = ref(false);
const error = ref("");
const selectedObat = ref(null);
const result = ref([]);
const allObat = ref([]);
let timeout = null;

const bentukOptions = ref([])
const allSatuanDosis = ref([])
const satuanDosisOptions = ref([])
const loadingSatuanDosis = ref(false)
const errorSatuanDosis = ref("")
const selectBentuk = ref("");
const selectedSatuanDosis = ref("");
const brand = ref("");
const dosis = ref(0);
const nomorBatch = ref("");
const jumlah = ref(0);
const tanggalKadaluarsa = ref("");
const namaSupplier = ref("");
const alamatSupplier = ref("");
const kontakSupplier = ref("");

const applySatuanByBentuk = (bentukObatId) => {
    const bentukId = Number(bentukObatId);
    if (!Number.isFinite(bentukId) || bentukId <= 0) {
        satuanDosisOptions.value = [];
        return;
    }

    satuanDosisOptions.value = allSatuanDosis.value.filter(
        (item) => Number(item.bentuk_obat_id) === bentukId,
    );
};

const fetchAllSatuanDosis = async () => {
    try {
        const res = await fetch('/api/satuan-dosis');
        if (!res.ok) {
            throw new Error('Gagal mengambil satuan dosis');
        }
        const data = await res.json();
        allSatuanDosis.value = data.data || [];
    } catch (err) {
        allSatuanDosis.value = [];
    }
};

const fetchSatuanDosis = async (bentukObatId) => {
    try {
        if (!bentukObatId) {
            satuanDosisOptions.value = [];
            selectedSatuanDosis.value = "";
            errorSatuanDosis.value = "";
            return;
        }

        loadingSatuanDosis.value = true;
        errorSatuanDosis.value = "";
        const res = await fetch(`/api/satuan-dosis?bentuk_obat_id=${encodeURIComponent(bentukObatId)}`);
        if (!res.ok) {
            throw new Error("Gagal mengambil satuan dosis");
        }
        const data = await res.json();
        satuanDosisOptions.value = data.data || [];
        if (satuanDosisOptions.value.length === 0) {
            applySatuanByBentuk(bentukObatId);
        }
        selectedSatuanDosis.value = "";
        if (satuanDosisOptions.value.length === 0) {
            errorSatuanDosis.value = "Satuan dosis untuk bentuk obat ini belum tersedia";
        }
    } catch (err) {
        applySatuanByBentuk(bentukObatId);
        selectedSatuanDosis.value = "";
        errorSatuanDosis.value = satuanDosisOptions.value.length === 0
            ? "Gagal memuat satuan dosis"
            : "";
    } finally {
        loadingSatuanDosis.value = false;
    }
};

onMounted(async () => {
    await fetchAllSatuanDosis();

    try {
        const res = await fetch("/api/bentuk-obat");
        const data = await res.json();
        bentukOptions.value = data.data || [];
    } catch (err) {
        console.error("Gagal ambil bentuk obat:", err);
    }
    // Ambil semua obat untuk dropdown awal
    try {
        const resObat = await fetch("/api/obat");
        const dataObat = await resObat.json();
        allObat.value = dataObat.data || [];
    } catch (err) {
        console.error("Gagal ambil data obat:", err);
    }
});

watch(selectBentuk, fetchSatuanDosis);
watch(selectedSatuanDosis, (newValue) => {
    if (!newValue) {
        return;
    }
    selectedSatuanDosis.value = String(newValue);
});

const handleSearch = (newValue) => {

    clearTimeout(timeout);
    if (!newValue) {
        // Jika input kosong, tampilkan semua obat
        result.value = allObat.value;
        return;
    }
    // Filter case-insensitive
    const filtered = allObat.value.filter(obat =>
        obat.nama_obat && obat.nama_obat.toLowerCase().includes(newValue.toLowerCase())
    );
    if (filtered.length > 0) {
        result.value = filtered;
        return;
    }
    // fallback ke API search
    timeout = setTimeout(async () => {
        try {
            loading.value = true;
            error.value = "";
            const res = await fetch(`/api/obat/search?q=${encodeURIComponent(newValue)}`);
            const data = await res.json();
            result.value = data.data || [];
        } catch (err) {
            console.error(err);
            error.value = "Terjadi kesalahan saat mencari obat";
        } finally {
            loading.value = false;
        }
    }, 300);

}
watch(searchQueryObat, handleSearch);

const selectObat = (obat) => {
    selectedObat.value = obat;
    searchQueryObat.value = obat.nama_obat;
    result.value = [];
};

const clearSelectedObat = () => {
    selectedObat.value = null;
    searchQueryObat.value = "";
    result.value = [];
};

const submitForm = async () => {
    if (!selectedObat.value) {
        alert ("Pilih obat dulu!");
        return;
    }

    if (!selectBentuk.value) {
        alert("Pilih bentuk obat dulu!");
        return;
    }

    if (!selectedSatuanDosis.value) {
        alert("Pilih satuan dosis dulu!");
        return;
    }

    const payload = {
        obat_id: selectedObat.value.id,
        brand: brand.value || "",
        bentuk_obat_id: Number(selectBentuk.value) || null,
        dosis: Number(dosis.value) || 0,
        satuan_dosis_id: Number(selectedSatuanDosis.value),
        nama_supplier: namaSupplier.value || "",
        alamat_supplier: alamatSupplier.value || "",
        kontak_supplier: kontakSupplier.value || "",
        DetailStoks: [
            {
            produk_obat_id: selectedObat.value.id,
                jumlah_obat: Number(jumlah.value) || 0,
                nomor_batch: nomorBatch.value || "",
                tanggal_kadaluarsa: tanggalKadaluarsa.value || ""
            }
        ]
    };

    try {
        const res = await fetch('/api/stok/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok || data.success === false) {
            alert(data.message || "Gagal membuat stok");
            return;
        }
        alert("Pengadaan baru berhasil ditambahkan ke Gudang");
        brand.value = "";
        selectBentuk.value = "";
        selectedSatuanDosis.value = "";
        dosis.value = 0;
        nomorBatch.value = "";
        jumlah.value = 0;
        tanggalKadaluarsa.value = "";
        namaSupplier.value = "";
        alamatSupplier.value = "";
        kontakSupplier.value = "";
        selectedObat.value = null;
        searchQueryObat.value = "";
    } catch (error) {
        console.error("Error submitting form:", error);
    }
};

</script>

<template>
    <div class="create-stok-view">

        <div class="form-container">
            <h2>Form Pengadaan Baru</h2>
            <form @submit.prevent="submitForm">
                <div class="form-group">
                    <div class="search-container">
                        <input type="text" placeholder="Cari Obat ..." v-model="searchQueryObat" />
                        <ul v-if="result.length > 0 && !selectedObat">
                            <li v-for="obat in result" :key="obat.id" @click="selectObat(obat)">
                                {{ obat.nama_obat }}
                            </li>
                        </ul>
                        <input type="text" v-if="selectedObat" placeholder="" v-model="selectedObat.nama_obat" readonly>
                        <button v-if="selectedObat" type="button" @click="clearSelectedObat" style="margin-bottom:12px;">Ganti Obat</button>

                        <div class="produk-obat">
                            <input type="text" placeholder="Brand" v-model="brand" />
                            <select v-model="selectBentuk">
                                <option value="" disabled>Pilih Bentuk Obat ...</option>
                                <option v-for="b in bentukOptions" :key="b.id" :value="b.id">
                                    {{ b.nama_bentuk_obat }}
                                </option>
                            </select>
                            <input type="number" min="1" placeholder="Dosis" v-model="dosis" />
                            <select v-model="selectedSatuanDosis" :disabled="!selectBentuk || loadingSatuanDosis || satuanDosisOptions.length === 0">
                                <option value="" disabled>Pilih Satuan Dosis ...</option>
                                <option v-for="unit in satuanDosisOptions" :key="unit.id" :value="String(unit.id)">
                                    {{ unit.nama_satuan_dosis }}
                                </option>
                            </select>
                            <small v-if="loadingSatuanDosis">Memuat satuan dosis...</small>
                            <small v-if="errorSatuanDosis" style="color:#b00020;">{{ errorSatuanDosis }}</small>
                        </div>
                        <div class="create-stok">
                            <input type="text" placeholder="Nomor Batch" v-model="nomorBatch" />
                            <input type="number" placeholder="Jumlah" v-model="jumlah" />
                            <input type="date" v-model="tanggalKadaluarsa" />
                        </div>
                        <div class="supplier-data">
                            <input type="text" placeholder="Nama Supplier" v-model="namaSupplier" />
                            <input type="text" placeholder="Alamat Supplier" v-model="alamatSupplier" />
                            <input type="text" placeholder="Kontak Supplier" v-model="kontakSupplier" />
                        </div>
                    </div>
                </div>
                <button type="submit" class="submit-btn">Submit</button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.create-stok-view {
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
    max-width: 1200px;
    margin: 32px auto;
}

.form-container h2 {
    margin-bottom: 24px;
    font-size: 1.5rem;
    color: #2d3748;
    text-align: center;
}

.form-group {
    margin-bottom: 18px;
}

.search-container {
    position: relative;
}

.search-container input[type="text"],
.search-container input[type="number"] {
    width: 100%;
    padding: 10px 12px;
    margin-bottom: 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 1rem;
    transition: border 0.2s;
    background: #f9fafb;
}

.search-container input[type="text"]:focus,
.search-container input[type="number"]:focus {
    border-color: #3182ce;
    outline: none;
    background: #fff;
}

.search-container ul {
    position: absolute;
    left: 0;
    right: 0;
    top: 42px;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.07);
    z-index: 10;
    max-height: 180px;
    overflow-y: auto;
    padding: 0;
    margin: 0;
    list-style: none;
}

.search-container ul li {
    padding: 10px 14px;
    cursor: pointer;
    transition: background 0.15s;
}

.search-container ul li:hover {
    background: #f1f5f9;
}


/* Atur input produk-obat dan create-stok secara vertikal */
.produk-obat,
.create-stok,
.supplier-data {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 16px;
}

.produk-obat input,
.create-stok input,
.produk-obat select {
    width: 100%;
    margin-bottom: 0;
}

.rekap-table {
    width: 100%;
    border-collapse: collapse;
}

.rekap-table th,
.rekap-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
}

.rekap-table th {
    background: #f3f3f3;
}

form {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

@media (max-width: 700px) {
    .form-container {
        padding: 12px 2vw;
        width: 99vw;
        margin: 12px 0;
    }
}
</style>