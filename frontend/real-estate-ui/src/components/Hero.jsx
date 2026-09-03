import './Hero.css';

const Hero = ({ searchTerm, onSearchChange }) => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Find your ideal property</h1>
        <p>Explore thousands of properties in the best locations</p>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by city, area, or zip code..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button
            className="search-button"
            onClick={() => console.log('Searching:', searchTerm)}
          >
            🔍 Search
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;