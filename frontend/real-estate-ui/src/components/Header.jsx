import { Link } from 'react-router-dom'
import './layout/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <span className="logo-icon">🏠</span>
        <span className="logo-text">Real Estate Explorer</span>
      </div>
      <nav className="nav-links">
        <a href="#" className="nav-link active">Inicio</a>
        <a href="#" className="nav-link">Buscar</a>
        <a href="#" className="nav-link">Dashboard</a>
        <a href="#" className="nav-link login-btn">Iniciar sesión</a>
      </nav>
    </header>
  );
};

export default Header;