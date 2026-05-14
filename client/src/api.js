const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("pulsepost-token");
  const headers = {
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  login(payload) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  me() {
    return request("/auth/me");
  },
  getConnections() {
    return request("/social/accounts");
  },
  getPosts() {
    return request("/posts");
  },
  createPost(payload) {
    return request("/posts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  uploadVideo(formData) {
    return request("/uploads/video", {
      method: "POST",
      body: formData,
    });
  },
  getOAuthUrl(provider) {
    return request(`/social/${provider}/url`);
  },
  generateCaption(payload) {
    return request("/ai/generate-caption", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  submitContact(payload) {
    return request("/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getAnalytics() {
    return request("/analytics");
  }
};

export async function startOAuth(provider) {
  const data = await api.getOAuthUrl(provider);
  window.location.href = data.authorizationUrl;
}
