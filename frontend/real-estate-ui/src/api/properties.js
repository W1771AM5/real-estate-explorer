const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5064';

export const PROPERTIES_ENDPOINT = `${API_BASE_URL}/api/properties`;

export async function getProperties({ signal } = {}) {
  const response = await fetch(PROPERTIES_ENDPOINT, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}