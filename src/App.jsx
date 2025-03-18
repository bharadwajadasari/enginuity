import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import CalibrationPage from './pages/CalibrationPage';
import PromotionPage from './pages/PromotionPage';
import EvaluationPage from './pages/EvaluationPage';
import AddEngineerPage from './pages/AddEngineerPage';
import logo from './assets/logo.png';
import './App.css';

function HomePage() {
  return (
    <div className="home-container">
      <div className="section-grid">
        <Link to="/calibration" className="section-tile">
          <h2>Calibration</h2>
          <p>Evaluate and calibrate team performance</p>
        </Link>
        <Link to="/promotion" className="section-tile">
          <h2>Promotion</h2>
          <p>Track and manage promotion readiness</p>
        </Link>
      </div>
    </div>
  );
}

function NavigationBar() {
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const response = await fetch('/api/engineers');
        const data = await response.json();
        setEngineers(data);
      } catch (error) {
        console.error('Error fetching engineers:', error);
      }
    };

    fetchEngineers();
  }, []);

  const handleEngineerSelect = (e) => {
    const engineerId = e.target.value;
    setSelectedEngineer(engineerId);
    if (engineerId) {
      navigate(`/evaluation/${engineerId}`);
    }
  };

  return (
    <nav className="main-nav">
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/calibration" className="nav-link">Calibration</Link>
        <Link to="/promotion" className="nav-link">Promotion</Link>
      </div>
      <div className="nav-actions">
        <select 
          value={selectedEngineer} 
          onChange={handleEngineerSelect}
          className="engineer-select"
        >
          <option value="">Select Engineer</option>
          {engineers.map(engineer => (
            <option key={engineer.id} value={engineer.id}>
              {engineer.first_name} {engineer.last_name}
            </option>
          ))}
        </select>
        <button 
          onClick={() => navigate('/add-engineer')}
          className="add-engineer-button"
        >
          Add Engineer
        </button>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <div className="logo-container">
              <img src={logo} alt="Enginuity Logo" className="app-logo" />
            </div>
            <div className="header-text">
              <h1>Enginuity</h1>
              <p>Engineer Performance Evaluation System</p>
            </div>
          </div>
        </header>
        <NavigationBar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/calibration" element={<CalibrationPage />} />
            <Route path="/promotion" element={<PromotionPage />} />
            <Route path="/evaluation/:engineerId" element={<EvaluationPage />} />
            <Route path="/add-engineer" element={<AddEngineerPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 