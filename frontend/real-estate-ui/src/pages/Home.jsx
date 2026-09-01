import { useState } from 'react';
import { properties } from '../data/properties';
import Hero from '../components/Hero';
import PropertyCard from '../components/PropertyCard';

const Home = ({ onSelectProperty }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProperties = properties.filter((property) => {
    const term = searchTerm.toLowerCase();
    return property.city.toLowerCase().includes(term) ||
           property.title.toLowerCase().includes(term);
  });

  return (
    <>
      <Hero searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <section className="properties-section">
        <div className="section-header">
          <h2>🏠 Featured Properties</h2>
          <p>The best options for you</p>
        </div>

        {filteredProperties.length === 0 && (
          <p className="no-results">No properties found for "{searchTerm}"</p>
        )}

        <div className="properties-grid">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;