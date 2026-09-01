import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>🏠 Real Estate Explorer</h4>
          <p>Find the property of your dreams</p>
        </div>
        <div className="footer-section">
          <h4>Links</h4>
          <a href="#">About us</a>
          <a href="#">Contact</a>
          <a href="#">Terms and conditions</a>
        </div>
        <div className="footer-section">
          <h4>Follow us</h4>
          <div className="social-links">
            <a href="#" aria-label="Phone">📱</a>
            <a href="#" aria-label="Twitter">🐦</a>
            <a href="#" aria-label="Facebook">📘</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Real Estate Explorer. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;