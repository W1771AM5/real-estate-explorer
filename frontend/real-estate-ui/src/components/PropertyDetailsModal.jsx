import { useEffect } from 'react';
import { currencyFormatter } from '../utils/format';
import './PropertyDetailsModal.css';

function PropertyDetailsModal({ property, onClose }) {
  useEffect(() => {
    if (!property) return undefined;

    function handleKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [property, onClose]);

  if (!property) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <div className="modal-image">
          <span className="property-icon-large">{property.image}</span>
        </div>

        <h2>{property.title}</h2>
        <p className="modal-price">{currencyFormatter.format(property.price)}</p>

        <div className="modal-details">
          <div className="detail-item">
            <span>🛏️ Bedrooms</span>
            <strong>{property.bedrooms}</strong>
          </div>
          <div className="detail-item">
            <span>🛁 Bathrooms</span>
            <strong>{property.bathrooms}</strong>
          </div>
          <div className="detail-item">
            <span>📐 Area</span>
            <strong>{property.area}</strong>
          </div>
        </div>

        <p className="modal-location">📍 {property.city}</p>

        <button className="contact-button">Contact agent</button>
      </div>
    </div>
  );
}

export default PropertyDetailsModal;