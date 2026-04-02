import { ref, onMounted } from "vue";


export function usePasienView() {
  const searchQuery = ref("");
  const pasien = ref(null);
  const loading = ref(false);
  const error = ref("");

  const statusDispensingOptions = ref([]);
  const updatingAll = ref(false);

  const cariPasien = async () => {
    const query = searchQuery.value.trim();
    if (!query) return;                   

    loading.value = true;
    error.value = "";
    pasien.value = null;

    try {
      const res = await fetch(`/api/pasien/no_reg/${encodeURIComponent(query)}`);
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

  const resetSearch = () => {
    searchQuery.value = "";
    pasien.value = null;
    error.value = "";
  };

  const formatTanggal = (tgl) => {
    if (!tgl) return "-";
    return new Date(tgl).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  onMounted(async () => {
    try {
      const res = await fetch("/api/status-dispensing");
      const result = await res.json();
      statusDispensingOptions.value = (result.data || []).map((s) => ({
        value: s.id,
        label: s.nama_status,
      }));
    } catch (err) {
      console.error("Gagal fetch status dispensing", err);
    }
  });

  const postStatusDispensing = async (detail) => {
    const res = await fetch("/api/dispensing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        detail_resep_id: detail.id,
        apoteker_id: 1,
        status_dispensing_id: Number(detail.selectedStatus),
        dispensingAt: new Date(),
      }),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message || "Gagal update");

    detail.dispensing = detail.dispensing || [];
    detail.dispensing.push(result.data);
  };

  const getLatestStatus = (detail) => {
    const lastDisp = detail.dispensing?.[detail.dispensing.length - 1];
    return lastDisp?.status?.nama_status || "Belum diupdate";
  };

  const updateAllStatus = async () => {
    const details = (pasien.value?.reseps || [])
      .flatMap((r) => r.detailReseps || [])
      .filter((d) => d.selectedStatus && getLatestStatus(d) !== "Sudah");

    if (!details.length) {
      alert("Tidak ada data yang bisa diupdate.");
      return;
    }

    updatingAll.value = true;
    try {
      await Promise.all(details.map((d) => postStatusDispensing(d)));
      alert("Berhasil update semua!");
    } catch (err) {
      console.error(err);
      alert("Gagal update: " + err.message);
    } finally {
      updatingAll.value = false;
    }
  };

  return {
    searchQuery,
    pasien,
    loading,
    error,
    statusDispensingOptions,
    updatingAll,
    cariPasien,
    resetSearch,
    formatTanggal,
    postStatusDispensing,
    getLatestStatus,
    updateAllStatus,
  };
}
