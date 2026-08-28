import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>📋 Panel</h3>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          🏠 Inicio
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          🔍 Search
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          📊 Analytics
        </NavLink>
        <NavLink to="/map" className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
          🗺️ Map
        </NavLink>
      </nav>

      <div className='sidebar-footer'>
        <button className='login-btn-sidebar'>🔑 Iniciar sesión</button>
      </div>
    </aside>
  );
};

export default Sidebar;