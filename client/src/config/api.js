function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl() {
  const envBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (envBaseUrl) {
    return trimTrailingSlash(envBaseUrl);
  }

  if (import.meta.env.DEV) {
    return "http://localhost:3001";
  }

  // In production, default to same-origin (for Vercel /api routes).
  return "";
}

export function getSurvivalApiUrl() {
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}/api/survival` : "/api/survival";
}
