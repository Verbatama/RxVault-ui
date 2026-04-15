<template>
  <div class="stok-keluar-view">
    <h2>Stok Keluar by Nomor Registrasi</h2>

    <div class="form-grid">
      <input v-model="noRegistrasi" placeholder="Nomor Registrasi" />
      
      <button type="button" @click="fetchByNoReg">Refresh Data</button>
      <button type="button" @click="processStokKeluar">Proses Stok Keluar</button>
    </div>

    <p v-if="message" class="ok-msg">{{ message }}</p>
    <p v-if="error" class="error-msg">{{ error }}</p>

    <table v-if="details.length > 0" class="table">
      <thead>
        <tr>
          <th>Obat</th>
          <th>Pilih Produk Obat</th>
          <th>Jumlah Resep</th>
          <th>Status Dispensing</th>
          <th>Stok Keluar</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="d in details" :key="d.detail_resep_id">
        <td>{{ d.nama_obat }}</td>
          <td>
            <select
              v-model="selectedProdukObatIdByDetail[d.detail_resep_id]"
              :disabled="d.is_stok_keluar || getRekapOptionsForDetail(d).length === 0"
            >
              <option :value="null" disabled>{{ getSelectPlaceholderLabel(d) }}</option>
              <option
                v-for="opt in getRekapOptionsForDetail(d)"
                :key="opt.produk_obat_id"
                :value="opt.produk_obat_id"
              >
                {{ formatRekapOption(opt) }}
              </option>
            </select>
          </td>
          <td>{{ d.jumlah_resep }}</td>
          <td>{{ d.status_dispensing }}</td>
          <td>{{ d.is_stok_keluar ? 'Sudah' : 'Belum' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from "vue";
import { useRoute } from "vue-router";
import { getApotekerAuthHeader, getApotekerSession } from "../utils/apotekerAuth";

const route = useRoute();

const asSingleString = (value) => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
};

const noRegistrasi = ref(asSingleString(route.query.no_registrasi));
const apotekerName = ref(getApotekerSession()?.apoteker?.nama_apoteker || "-");
const details = ref([]);
const stokRekap = ref([]);
const selectedProdukObatIdByDetail = reactive({});
const message = ref("");
const error = ref("");

const createIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const fetchRekapStokApotek = async () => {
  try {
    const res = await fetch("/api/stok/rekap", {
      headers: {
        ...getApotekerAuthHeader(),
      },
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      stokRekap.value = [];
      return;
    }
    stokRekap.value = Array.isArray(data.data) ? data.data : [];
  } catch (err) {
    stokRekap.value = [];
  }
};

const getRekapOptionsForDetail = (detail) => {
  const obatId = Number(detail?.obat_id);
  return (stokRekap.value || [])
    .filter((item) => Number(item?.obat_id) === obatId)
    .filter((item) => Number(item?.stok_apotek || 0) > 0);
};

const formatRekapOption = (opt) => {
  const nama = opt?.nama_obat || "-";
  const dosis = opt?.dosis ? `${opt.dosis} ${opt?.satuan_dosis || ""}`.trim() : "";
  const bentuk = opt?.nama_bentuk_obat ? `(${opt.nama_bentuk_obat})` : "";
  const stok = `stok: ${Number(opt?.stok_apotek || 0)}`;
  return [nama, dosis, bentuk].filter(Boolean).join(" ") + ` | ${stok}`;
};

const getSelectPlaceholderLabel = (detail) => {
  const nama = detail?.nama_obat || "Obat";
  const optionsCount = getRekapOptionsForDetail(detail).length;
  if (optionsCount === 0) {
    return `${nama} - stok apotek kosong`;
  }
  return `${nama} - pilih obat`;
};

const syncDefaultSelections = () => {
  for (const d of details.value || []) {
    const key = d.detail_resep_id;
    const options = getRekapOptionsForDetail(d);
    const current = selectedProdukObatIdByDetail[key];
    const stillValid = options.some((o) => Number(o.produk_obat_id) === Number(current));

    if (stillValid) {
      continue;
    }

    selectedProdukObatIdByDetail[key] = options.length > 0 ? Number(options[0].produk_obat_id) : null;
  }
};

const fetchByNoReg = async () => {
  try {
    error.value = "";
    message.value = "";
    if (!noRegistrasi.value) {
      details.value = [];
      return;
    }

    await fetchRekapStokApotek();

    const res = await fetch(`/api/dispensing/by-no-reg/${encodeURIComponent(noRegistrasi.value)}`, {
      headers: {
        ...getApotekerAuthHeader(),
      },
    });
    const data = await res.json();
    if (!res.ok || data.success === false) {
      error.value = data.message || "Data tidak ditemukan";
      details.value = [];
      return;
    }
    details.value = data?.data?.details || [];
    syncDefaultSelections();
  } catch (err) {
    error.value = "Terjadi kesalahan saat mengambil data";
    details.value = [];
  }
};

const processStokKeluar = async () => {
  try {
    error.value = "";
    message.value = "";

    if (!noRegistrasi.value) {
      error.value = "Nomor registrasi wajib diisi";
      return;
    }
    const items = [];
    const missing = [];
    for (const d of details.value || []) {
      if (d.is_stok_keluar) {
        continue;
      }
      const status = String(d.status_dispensing || "").toLowerCase();
      if (status !== "sudah" && status !== "pending") {
        continue;
      }
      const selected = selectedProdukObatIdByDetail[d.detail_resep_id];
      if (!selected) {
        missing.push(d.nama_obat || `detail ${d.detail_resep_id}`);
        continue;
      }
      items.push({
        detail_resep_id: Number(d.detail_resep_id),
        produk_obat_id: Number(selected),
      });
    }

    if (missing.length > 0) {
      error.value = `Pilih obat dari stok apotek untuk: ${missing.join(", ")}`;
      return;
    }

    const payload = {
      no_registrasi: noRegistrasi.value,
      items,
    };

    const res = await fetch("/api/stok-keluar/by-no-reg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-idempotency-key": createIdempotencyKey(),
        ...getApotekerAuthHeader(),
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok || data.success === false) {
      error.value = data.message || "Gagal proses stok keluar";
      return;
    }

    const okCount = data?.data?.processed?.length || 0;
    const failCount = data?.data?.failed?.length || 0;
    message.value = `Proses stok keluar selesai. Berhasil: ${okCount}, gagal: ${failCount}`;
    await fetchByNoReg();
  } catch (err) {
    error.value = "Terjadi kesalahan saat proses stok keluar";
  }
};

onMounted(async () => {
  await fetchRekapStokApotek();
  await fetchByNoReg();
});
</script>

<style scoped>
.stok-keluar-view { padding: 20px; }
.form-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr auto auto;
  gap: 8px;
  margin-bottom: 12px;
}
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
.ok-msg { color: #1a7f37; }
.error-msg { color: #b00020; }
</style>
