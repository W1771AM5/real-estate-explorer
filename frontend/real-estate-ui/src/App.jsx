import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

function App() {
  
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
              />
              <button className="search-button">🔍 Buscar</button>
            </div>
          </div>
        </section>

        <section className="properties-section">
          <div className="section-header">
            <h2>🏠 Propiedades destacadas</h2>
            <p>Las mejores opciones para ti</p>
          </div>

          <div className="properties-grid">
            {propiedades.map((prop) => (
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
                  <button className="view-button">Ver detalles</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;