import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5064';
const PROPERTIES_ENDPOINT = `${API_BASE_URL}/api/properties`;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProperties() {
      try {
        const response = await fetch(PROPERTIES_ENDPOINT, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setProperties(data);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadProperties();

    return () => controller.abort();
  }, []);

  return (
    <section>
      <h1>Available Properties</h1>

      {loading && (
        <div role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          Loading properties…
        </div>
      )}

      {error && !loading && (
        <p role="alert" style={{ color: 'crimson' }}>
          Could not load properties: {error}
        </p>
      )}

      {!loading && !error && properties.length === 0 && (
        <p>No properties available.</p>
      )}

      {!loading && !error && properties.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>City</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id}>
                <td>{property.id}</td>
                <td>{property.city}</td>
                <td>{currencyFormatter.format(property.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default Home;