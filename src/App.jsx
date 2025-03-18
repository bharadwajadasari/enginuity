import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CalibrationPage from './pages/CalibrationPage';
import PromotionPage from './pages/PromotionPage';
import EvaluationPage from './pages/EvaluationPage';
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

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>Enginuity</h1>
          <p>Engineer Performance Evaluation System</p>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/calibration" element={<CalibrationPage />} />
            <Route path="/promotion" element={<PromotionPage />} />
            <Route path="/evaluation/:engineerId" element={<EvaluationPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 