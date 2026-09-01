import { currencyFormatter } from '../utils/format';
import './PropertyCard.css';

function PropertyCard({ property, onSelect }) {
  return (
    <div className="property-card">
      <div className="property-image">
        <span className="property-icon">{property.image}</span>
      </div>
      <div className="property-info">
        <h3>{property.title}</h3>
        <p className="property-price">{currencyFormatter.format(property.price)}</p>
        <div className="property-details">
          <span>🛏️ {property.bedrooms}</span>
          <span>🛁 {property.bathrooms}</span>
          <span>📐 {property.area}</span>
        </div>
        <p className="property-city">📍 {property.city}</p>
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