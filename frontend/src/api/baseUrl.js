/** URL бэкенда (Render / Railway). Задаётся при сборке: VITE_API_URL */
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw || !String(raw).trim()) {
    if (import.meta.env.PROD) {
      throw new Error(
        'VITE_API_URL не задан при сборке. Укажите URL бэка в Netlify → Environment variables или в netlify.toml.',
      );
    }
    return '';
  }
  return String(raw).trim().replace(/\/$/, '');
}
