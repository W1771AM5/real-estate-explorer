import { useEffect, useMemo, useState } from 'react';
import PropertyCard from '../components/PropertyCard';
import { getProperties } from '../api/properties';
import './Search.css';

function Search({ onSelectProperty }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [city, setCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const data = await getProperties({ take: 1000, signal: controller.signal });
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

  const cities = useMemo(() => {
    const set = new Set();
    for (const p of properties) {
      if (p.locality) set.add(p.locality);
    }
    return [...set].sort();
  }, [properties]);

  const results = useMemo(() => {
    return properties.filter((property) => {
      const matchesCity = city ? property.locality === city : true;
      const matchesPrice = maxPrice
        ? property.price != null && property.price <= Number(maxPrice)
        : true;
      const matchesBedrooms = bedrooms
        ? property.beds != null && property.beds >= Number(bedrooms)
        : true;

      return matchesCity && matchesPrice && matchesBedrooms;
    });
  }, [properties, city, maxPrice, bedrooms]);

  return (
    <div className="search-container">
      <h1>🔍 Advanced Search</h1>

      <div className="search-filters">
        <div className="filter-group">
          <label htmlFor="city-filter">City</label>
          <select id="city-filter" value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="price-filter">Max Price ($)</label>
          <input
            id="price-filter"
            type="number"
            placeholder="e.g. 1000000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="bedrooms-filter">Bedrooms (minimum)</label>
          <select id="bedrooms-filter" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)}>
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
      </div>

      <div className="search-results">
        <h2>Results: {loading ? '…' : `${results.length} properties`}</h2>

        {error && !loading && (
          <p role="alert" className="api-error">
            Could not load properties: {error}
          </p>
        )}

        {!loading && !error && results.length === 0 && (
          <p className="no-results">No properties match those filters. Try different criteria.</p>
        )}

        <div className="properties-grid">
          {results.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Search;
