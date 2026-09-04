import { currencyFormatter } from '../utils/format';
import './PropertyCard.css';

function PropertyCard({ property, onSelect }) {
  const title = property.brokerTitle || property.address || 'Property';
  const areaText = property.propertySqft ? `${property.propertySqft.toLocaleString()} sqft` : '—';
  const cityText = [property.sublocality, property.locality].filter(Boolean).join(', ');

  return (
    <div className="property-card">
      <div className="property-image">
        <span className="property-icon" aria-hidden="true">🏠</span>
      </div>
      <div className="property-info">
        <h3>{title}</h3>
        <p className="property-price">{currencyFormatter.format(property.price ?? 0)}</p>
        <div className="property-details">
          <span>🛏️ {property.beds ?? '—'}</span>
          <span>🛁 {property.baths ?? '—'}</span>
          <span>📐 {areaText}</span>
        </div>
        <p className="property-city">📍 {cityText || '—'}</p>
        {onSelect && (
          <button className="view-button" onClick={() => onSelect(property)}>
            View details
          </button>
        )}
      </div>
    </div>
  );
}

export default PropertyCard;
