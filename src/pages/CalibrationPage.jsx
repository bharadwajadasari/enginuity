import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CalibrationPage.css';

function CalibrationPage() {
  const [engineers, setEngineers] = useState([]);
  const [evaluatedEngineers, setEvaluatedEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchEngineers = async () => {
      try {
        const response = await fetch('/api/engineers');
        const data = await response.json();
        setEngineers(data);
        
        // TODO: Replace with actual API call
        const evaluatedResponse = await fetch('/api/evaluations/recent');
        const evaluatedData = await evaluatedResponse.json();
        setEvaluatedEngineers(evaluatedData.map(evaluation => evaluation.engineer_id));
      } catch (error) {
        console.error('Error fetching engineers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEngineers();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="calibration-page">
      <div className="page-header">
        <h2>Team Calibration</h2>
        <p>Evaluate and calibrate team performance</p>
      </div>

      <div className="engineers-section">
        <h3>Engineers to Evaluate</h3>
        <div className="engineers-grid">
          {engineers
            .filter(engineer => !evaluatedEngineers.includes(engineer.id))
            .map(engineer => (
              <Link
                key={engineer.id}
                to={`/evaluation/${engineer.id}`}
                className="engineer-card"
              >
                <div className="engineer-info">
                  <h4>{engineer.first_name} {engineer.last_name}</h4>
                  <p>{engineer.current_role}</p>
                  <p className="department">{engineer.department}</p>
                </div>
                <div className="evaluation-status pending">
                  Pending Evaluation
                </div>
              </Link>
            ))}
        </div>
      </div>

      <div className="engineers-section">
        <h3>Recently Evaluated</h3>
        <div className="engineers-grid">
          {engineers
            .filter(engineer => evaluatedEngineers.includes(engineer.id))
            .map(engineer => (
              <div key={engineer.id} className="engineer-card evaluated">
                <div className="engineer-info">
                  <h4>{engineer.first_name} {engineer.last_name}</h4>
                  <p>{engineer.current_role}</p>
                  <p className="department">{engineer.department}</p>
                </div>
                <div className="evaluation-status completed">
                  Evaluation Completed
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default CalibrationPage; 