<template>
  <main class="login-page">
    <section class="login-card">
      <h1>Login Apoteker</h1>
      <p class="subtitle">Masuk dengan nama apoteker dan password.</p>

      <div class="field">
        <label for="nama-apoteker">Nama Apoteker</label>
        <input
          id="nama-apoteker"
          v-model.trim="namaApoteker"
          type="text"
          autocomplete="username"
          placeholder="Contoh: Masukan Nama"
          :disabled="loading"
        />
      </div>

      <div class="field">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="current-password"
          placeholder="Masukkan password"
          :disabled="loading"
        />
      </div>

      <p v-if="error" class="error">{{ error }}</p>

      <button type="button" class="login-btn" :disabled="loading" @click="login">
        {{ loading ? "Memproses..." : "Login" }}
      </button>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { isApotekerLoggedIn, saveApotekerSession } from "../utils/apotekerAuth";
import { apiUrl } from "../utils/api";

const route = useRoute();
const router = useRouter();

const namaApoteker = ref("");
const password = ref("");
const loading = ref(false);
const error = ref("");

const login = async () => {
  try {
    error.value = "";

    if (!namaApoteker.value || !password.value) {
      error.value = "Nama apoteker dan password wajib diisi";
      return;
    }

    loading.value = true;

    const res = await fetch(apiUrl("/api/apoteker/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nama_apoteker: namaApoteker.value,
        password: password.value,
      }),
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      error.value = data.message || "Login gagal";
      return;
    }

    saveApotekerSession(data.data || {});

    const redirectTo = typeof route.query.redirect === "string" ? route.query.redirect : "/dispensing";
    await router.replace(redirectTo);
  } catch (err) {
    error.value = "Terjadi kesalahan saat login";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  if (isApotekerLoggedIn()) {
    await router.replace("/dispensing");
  }
});
</script>

<style scoped>
.login-page {
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 24px;
  box-sizing: border-box;
  background: radial-gradient(circle at 10% 20%, #e2f9eb 0%, #f4fff8 45%, #ffffff 100%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border: 1px solid #d3e9dc;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 18px 40px rgba(22, 57, 35, 0.15);
}

.login-card h1 {
  margin: 0 0 8px;
  color: #1c3f2d;
}

.subtitle {
  margin: 0 0 16px;
  color: #466255;
}

.field {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
}

.field label {
  color: #1f4a33;
  font-weight: 600;
}

.field input {
  border: 1px solid #b9d7c4;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 14px;
}

.error {
  color: #b00020;
  margin: 0 0 12px;
}

.login-btn {
  width: 100%;
  border: none;
  border-radius: 10px;
  padding: 11px 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #2f855a 0%, #276749 100%);
  color: #fff;
  cursor: pointer;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
