const APOTEKER_AUTH_STORAGE_KEY = "rxvault.apoteker.auth";

const parseStoredSession = (rawValue) => {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (!parsed.token || !parsed.apoteker || !parsed.apoteker.id) {
      return null;
    }

    return {
      token: String(parsed.token),
      apoteker: {
        id: Number(parsed.apoteker.id),
        nama_apoteker: String(parsed.apoteker.nama_apoteker || ""),
      },
    };
  } catch (error) {
    return null;
  }
};

export const getApotekerSession = () => {
  const raw = localStorage.getItem(APOTEKER_AUTH_STORAGE_KEY);
  return parseStoredSession(raw);
};

export const saveApotekerSession = ({ token, apoteker }) => {
  const payload = {
    token: String(token || ""),
    apoteker: {
      id: Number(apoteker?.id),
      nama_apoteker: String(apoteker?.nama_apoteker || ""),
    },
  };

  localStorage.setItem(APOTEKER_AUTH_STORAGE_KEY, JSON.stringify(payload));
};

export const clearApotekerSession = () => {
  localStorage.removeItem(APOTEKER_AUTH_STORAGE_KEY);
};

export const isApotekerLoggedIn = () => {
  return Boolean(getApotekerSession()?.token);
};

export const getApotekerAuthHeader = () => {
  const token = getApotekerSession()?.token;
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};
