import { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';
import { getProperties } from '../api/properties';

const PAGE_SIZE = 24;

function Home({ onSelectProperty }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const data = await getProperties({ take: 200, signal: controller.signal });
        setProperties(data);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const filtered = properties.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (p.brokerTitle ?? '').toLowerCase().includes(term) ||
      (p.address ?? '').toLowerCase().includes(term) ||
      (p.locality ?? '').toLowerCase().includes(term) ||
      (p.sublocality ?? '').toLowerCase().includes(term) ||
      (p.zip ?? '').toLowerCase().includes(term)
    );
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visible.length < filtered.length;

  return (
    <>
      <Hero searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <section className="properties-section">
        <div className="section-header">
          <h2>🏠 Featured Properties</h2>
          <p>The best options for you</p>
        </div>

        {loading && (
          <div role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            Loading properties…
          </div>
        )}

        {error && !loading && (
          <p role="alert" className="api-error">
            Could not load properties: {error}
          </p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="no-results">No properties found for "{searchTerm}"</p>
        )}

        <div className="properties-grid">
          {visible.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
            />
          ))}
        </div>

        {hasMore && (
          <div className="load-more">
            <button
              type="button"
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            >
              Load more ({filtered.length - visible.length} remaining)
            </button>
          </div>
        )}
      </section>
    </>
  );
}

export default Home;
