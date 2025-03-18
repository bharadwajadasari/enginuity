import React, { useState, useEffect } from 'react';
import './PromotionPage.css';

function PromotionPage() {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchEngineers = async () => {
      try {
        const response = await fetch('/api/engineers/promotion-ready');
        const data = await response.json();
        setEngineers(data);
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
    <div className="promotion-page">
      <div className="page-header">
        <h2>Promotion Readiness</h2>
        <p>Track and manage promotion readiness across the team</p>
      </div>

      <div className="engineers-section">
        <h3>Promotion Ready Engineers</h3>
        <div className="engineers-grid">
          {engineers.map(engineer => (
            <div key={engineer.id} className="engineer-card">
              <div className="engineer-info">
                <h4>{engineer.first_name} {engineer.last_name}</h4>
                <p>Current Role: {engineer.current_role}</p>
                <p>Next Level: {engineer.next_level}</p>
                <p className="department">{engineer.department}</p>
              </div>
              <div className="promotion-status">
                <div className="readiness-score">
                  Readiness: {engineer.readiness_score}%
                </div>
                <div className="time-in-role">
                  Time in Role: {engineer.time_in_current_role} months
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PromotionPage; 