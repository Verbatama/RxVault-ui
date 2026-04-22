const normalizeBaseUrl = (value) => String(value || "").trim().replace(/\/+$/, "");

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

export const apiUrl = (path) => {
  const normalizedPath = String(path || "").startsWith("/") ? String(path) : `/${String(path || "")}`;

  if (!API_BASE_URL) {
    return normalizedPath;
  }

  return `${API_BASE_URL}${normalizedPath}`;
};