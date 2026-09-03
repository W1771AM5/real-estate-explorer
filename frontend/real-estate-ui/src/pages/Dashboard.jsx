import { propiedades } from '../data/propiedades'; 
import './Dashboard.css';

const Dashboard = () => {
  const totalPropiedades = propiedades.length;
  const totalCiudades = new Set(propiedades.map(prop => prop.ciudad)).size;
  const precioPromedio = totalPropiedades > 0 
    ? Math.round(propiedades.reduce((acc, prop) => acc + prop.precio, 0) / totalPropiedades) 
    : 0;

  const stats = [
    { label: 'Propiedades activas', value: totalPropiedades, icon: '🏠' },
    { label: 'Ciudades disponibles', value: totalCiudades, icon: '📍' },
    { label: 'Precio promedio ($)', value: precioPromedio.toLocaleString(), icon: '💵' },
    { label: 'Baños totales', value: propiedades.reduce((acc, prop) => acc + prop.banos, 0), icon: '🛁' },
  ];

  return (
    <div className="dashboard-container">
      <h1>Panel de Control</h1>
      <p className="dashboard-subtitle">Bienvenido de nuevo, Administrador</p>

      {totalPropiedades === 0 && (
        <div className="no-data-message">
          <p>🛑 No hay propiedades registradas.</p>
        </div>
      )}

      {totalPropiedades > 0 && (
        <>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-info">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-section">
            <h2>🏠 Todas las propiedades</h2>
            <div className="table-wrapper">
              <table className="properties-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Ciudad</th>
                    <th>Precio</th>
                    <th>Habitaciones</th>
                    <th>Baños</th>
                  </tr>
                </thead>
                <tbody>
                  {propiedades.map((prop) => (
                    <tr key={prop.id}>
                      <td>{prop.id}</td>
                      <td>{prop.titulo}</td>
                      <td>{prop.ciudad}</td>
                      <td>${prop.precio.toLocaleString()}</td>
                      <td>{prop.habitaciones}</td>
                      <td>{prop.banos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;