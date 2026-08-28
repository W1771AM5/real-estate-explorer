import './layout/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>🏠 Real Estate Explorer</h4>
          <p>Encuentra la propiedad de tus sueños</p>
        </div>
        <div className="footer-section">
          <h4>Enlaces</h4>
          <a href="#">Sobre nosotros</a>
          <a href="#">Contacto</a>
          <a href="#">Términos y condiciones</a>
        </div>
        <div className="footer-section">
          <h4>Síguenos</h4>
          <div className="social-links">
            <a href="#">📱</a>
            <a href="#">🐦</a>
            <a href="#">📘</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Real Estate Explorer. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;