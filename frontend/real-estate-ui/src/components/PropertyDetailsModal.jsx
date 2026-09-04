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

  const title = property.brokerTitle || property.address || 'Property';
  const areaText = property.propertySqft ? `${property.propertySqft.toLocaleString()} sqft` : '—';
  const cityText = [property.sublocality, property.locality].filter(Boolean).join(', ');
  const zipText = property.zip ? ` ${property.zip}` : '';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <div className="modal-image">
          <span className="property-icon-large" aria-hidden="true">🏠</span>
        </div>

        <h2>{title}</h2>
        <p className="modal-price">{currencyFormatter.format(property.price ?? 0)}</p>
        <p className="modal-status">
          <span className="status-badge">{property.listingStatus ?? '—'}</span>
          {property.propertyType && (
            <span className="status-badge type">{property.propertyType}</span>
          )}
        </p>

        <div className="modal-details">
          <div className="detail-item">
            <span>🛏️ Bedrooms</span>
            <strong>{property.beds ?? '—'}</strong>
          </div>
          <div className="detail-item">
            <span>🛁 Bathrooms</span>
            <strong>{property.baths ?? '—'}</strong>
          </div>
          <div className="detail-item">
            <span>📐 Area</span>
            <strong>{areaText}</strong>
          </div>
        </div>

        <p className="modal-location">📍 {property.address}</p>
        <p className="modal-location-secondary">{cityText}{zipText}</p>

        <button className="contact-button">Contact agent</button>
      </div>
    </div>
  );
}

export default PropertyDetailsModal;
