import Header from './components/Header';
import Footer from './components/Footer';
import './App.css'; 
import { useState } from 'react';

function App() {

  const [searchTerm, setSearchTerm] = useState ('');
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState(null);
  
  const propiedades = [
    {
      id: 1,
      titulo: 'Casa moderna en el centro',
      precio: '$250,000',
      habitaciones: 3,
      banos: 2,
      area: '180 m²',
      ciudad: 'Madrid',
      imagen: '🏠'
    },
    {
      id: 2,
      titulo: 'Apartamento con vistas al mar',
      precio: '$180,000',
      habitaciones: 2,
      banos: 1,
      area: '95 m²',
      ciudad: 'Barcelona',
      imagen: '🏢'
    },
    {
      id: 3,
      titulo: 'Casa rural con jardín',
      precio: '$320,000',
      habitaciones: 4,
      banos: 3,
      area: '250 m²',
      ciudad: 'Valencia',
      imagen: '🌳'
    },
    {
      id: 4,
      titulo: 'Ático de lujo',
      precio: '$450,000',
      habitaciones: 3,
      banos: 2,
      area: '160 m²',
      ciudad: 'Madrid',
      imagen: '✨'
    },
    {
      id: 5,
      titulo: 'Casa adosada familiar',
      precio: '$210,000',
      habitaciones: 3,
      banos: 2,
      area: '140 m²',
      ciudad: 'Sevilla',
      imagen: '🏡'
    },
    {
      id: 6,
      titulo: 'Estudio céntrico',
      precio: '$120,000',
      habitaciones: 1,
      banos: 1,
      area: '50 m²',
      ciudad: 'Málaga',
      imagen: '🏢'
    }
  ];

  const propiedadesFiltradas = propiedades.filter((prop) => {
    return prop.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
           prop.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  });

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <section className="hero">
          <div className="hero-content">
            <h1>Encuentra tu propiedad ideal</h1>
            <p>Explora miles de propiedades en las mejores ubicaciones</p>
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Buscar por ciudad, zona o código postal..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-button"
              onClick={() => console.log('Buscando:', searchTerm)}>🔍 Buscar</button>
            </div>
          </div>
        </section>

        <section className="properties-section">
          <div className="section-header">
            <h2>🏠 Propiedades destacadas</h2>
            <p>Las mejores opciones para ti</p>
          </div>
          
          {propiedadesFiltradas.length === 0 && (
            <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
            No se encontraron propiedades para "{searchTerm}"
            </p>
          )}

          <div className="properties-grid">
            {propiedadesFiltradas.map((prop) => (
              <div key={prop.id} className="property-card">
                <div className="property-image">
                  <span className="property-icon">{prop.imagen}</span>
                </div>
                <div className="property-info">
                  <h3>{prop.titulo}</h3>
                  <p className="property-price">{prop.precio}</p>
                  <div className="property-details">
                    <span>🛏️ {prop.habitaciones}</span>
                    <span>🛁 {prop.banos}</span>
                    <span>📐 {prop.area}</span>
                  </div>
                  <p className="property-city">📍 {prop.ciudad}</p>
                  <button className="view-button"
                          onClick={() => setPropiedadSeleccionada(prop)}>Ver detalles</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    
      {propiedadSeleccionada && (
        <div className="modal-overlay" onClick={() => setPropiedadSeleccionada(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPropiedadSeleccionada(null)}>
              &times;
            </button>
            
            <div className="modal-image">
              <span className="property-icon-large">{propiedadSeleccionada.imagen}</span>
            </div>
            
            <h2>{propiedadSeleccionada.titulo}</h2>
            <p className="modal-price">{propiedadSeleccionada.precio}</p>
            
            <div className="modal-details">
              <div className="detail-item">
                <span>🛏️ Habitaciones</span>
                <strong>{propiedadSeleccionada.habitaciones}</strong>
              </div>
              <div className="detail-item">
                <span>🛁 Baños</span>
                <strong>{propiedadSeleccionada.banos}</strong>
              </div>
              <div className="detail-item">
                <span>📐 Área</span>
                <strong>{propiedadSeleccionada.area}</strong>
              </div>
            </div>

            <p className="modal-location">📍 {propiedadSeleccionada.ciudad}</p>
            
            <button className="contact-button">Contactar al agente</button>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

export default App;