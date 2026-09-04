const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5064';

export const PROPERTIES_ENDPOINT = `${API_BASE_URL}/api/properties`;

export const PROPERTY_DETAILS_ENDPOINT = (id) => `${API_BASE_URL}/api/properties/${id}`;

/**
 * Builds a query string from a filter object. Skips empty / null / undefined.
 */
function buildQuery(filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters ?? {})) {
    if (value === null || value === undefined || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export async function getProperties({ signal, ...filters } = {}) {
  const response = await fetch(`${PROPERTIES_ENDPOINT}${buildQuery(filters)}`, { signal });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function getProperty(id, { signal } = {}) {
  const response = await fetch(PROPERTY_DETAILS_ENDPOINT(id), { signal });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Property ${id} not found`);
    }
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
