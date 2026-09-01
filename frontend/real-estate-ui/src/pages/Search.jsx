import { useState } from 'react';
import { propiedades } from '../data/propiedades';
import './Search.css';

const Search = () => {
  const [ciudad, setCiudad] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [habitaciones, setHabitaciones] = useState('');
  
  const ciudades = [...new Set(propiedades.map(prop => prop.ciudad))];

  const resultados = propiedades.filter((prop) => {
    const coincideCiudad = ciudad ? prop.ciudad === ciudad : true;
    const coincidePrecio = precioMax ? prop.precio <= Number(precioMax) : true;
    const coincideHabitaciones = habitaciones ? prop.habitaciones >= Number(habitaciones) : true;
    
    return coincideCiudad && coincidePrecio && coincideHabitaciones;
  });

  return (
    <div className="search-container">
      <h1>🔍 Búsqueda Avanzada</h1>
      
      <div className="search-filters">
        <div className="filter-group">
          <label>Ciudad</label>
          <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
            <option value="">Todas las ciudades</option>
            {ciudades.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Precio Máximo ($)</label>
          <input 
            type="number" 
            placeholder="Ej: 300000"
            value={precioMax}
            onChange={(e) => setPrecioMax(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Habitaciones (mínimo)</label>
          <select value={habitaciones} onChange={(e) => setHabitaciones(e.target.value)}>
            <option value="">Cualquiera</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>
        </div>
      </div>

      <div className="search-results">
        <h2>Resultados: {resultados.length} propiedades</h2>
        
        {resultados.length === 0 && (
          <p className="no-results">No se encontraron propiedades con esos filtros. Intenta cambiar los criterios.</p>
        )}

        <div className="properties-grid">
          {resultados.map((prop) => (
            <div key={prop.id} className="property-card">
              <div className="property-image">
                <span className="property-icon">{prop.imagen}</span>
              </div>
              <div className="property-info">
                <h3>{prop.titulo}</h3>
                <p className="property-price">${prop.precio.toLocaleString()}</p>
                <div className="property-details">
                  <span>🛏️ {prop.habitaciones}</span>
                  <span>🛁 {prop.banos}</span>
                  <span>📐 {prop.area}</span>
                </div>
                <p className="property-city">📍 {prop.ciudad}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Search;