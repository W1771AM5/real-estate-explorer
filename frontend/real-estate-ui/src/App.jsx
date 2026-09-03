import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Search from './pages/Search';
import Analytics from './pages/Analytics';
import Map from './pages/Map';
import PropertyDetailsModal from './components/PropertyDetailsModal';
import './App.css';

function App() {
  const [selectedProperty, setSelectedProperty] = useState(null);

  return (
    <Router>
      <div className="app">
        <Sidebar />

        <div className="app-body">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home onSelectProperty={setSelectedProperty} />} />
              <Route path="/search" element={<Search onSelectProperty={setSelectedProperty} />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/map" element={<Map />} />
            </Routes>
          </main>

          <Footer />
        </div>

        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      </div>
    </Router>
  );
}

export default App;