import './Dashboard.css';

const Dashboard = () => {
  
  const stats = [
    { label: 'Propiedades activas', value: 24, icon: '🏠' },
    { label: 'Mensajes nuevos', value: 8, icon: '💬' },
    { label: 'Visitas al perfil', value: 150, icon: '👁️' },
    { label: 'Favoritos guardados', value: 12, icon: '❤️' },
  ];

  return (
    <div className="dashboard-container">
      <h1>Panel de Control</h1>
      <p className="dashboard-subtitle">Bienvenido de nuevo, Administrador</p>

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
        <h2>Actividad reciente</h2>
        <ul className="activity-list">
          <li>📅 Nueva visita programada para la <strong>Casa rural en Valencia</strong>.</li>
          <li>✉️ Nuevo mensaje de <strong>María García</strong> sobre el Ático de lujo.</li>
          <li>🏠 Se agregó una nueva propiedad: <strong>Estudio céntrico en Málaga</strong>.</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;