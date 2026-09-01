import { useState } from 'react';
import { properties } from '../data/properties';
import PropertyCard from '../components/PropertyCard';
import './Search.css';

const Search = ({ onSelectProperty }) => {
  const [city, setCity] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');

  const cities = [...new Set(properties.map((property) => property.city))];

  const results = properties.filter((property) => {
    const matchesCity = city ? property.city === city : true;
    const matchesPrice = maxPrice ? property.price <= Number(maxPrice) : true;
    const matchesBedrooms = bedrooms ? property.bedrooms >= Number(bedrooms) : true;

    return matchesCity && matchesPrice && matchesBedrooms;
  });

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
            placeholder="e.g. 300000"
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
        <h2>Results: {results.length} properties</h2>

        {results.length === 0 && (
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
};

export default Search;