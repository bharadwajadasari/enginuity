import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CalibrationPage.css';

function CalibrationPage() {
  const navigate = useNavigate();
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [writeup, setWriteup] = useState(null);
  const [ratings, setRatings] = useState({
    technicalDelivery: {
      codeQuality: 0,
      timelinessOfDelivery: 0,
      architecturalProficiency: 0,
      comments: ''
    },
    communication: {
      effectiveCommunication: 0,
      crossTeamCollaboration: 0,
      architectureInfluence: 0,
      comments: ''
    }
  });

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const response = await fetch('/api/engineers');
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

  const handleEngineerSelect = async (engineer) => {
    setSelectedEngineer(engineer);
    setWriteup(null);

    try {
      // Fetch the most recent calibration for the selected engineer
      const response = await fetch(`/api/calibration/writeup/${engineer.id}`);
      if (response.ok) {
        const data = await response.json();
        // Update ratings with existing values
        setRatings({
          technicalDelivery: {
            codeQuality: data.technicalDelivery.codeQuality || 0,
            timelinessOfDelivery: data.technicalDelivery.timelinessOfDelivery || 0,
            architecturalProficiency: data.technicalDelivery.architecturalProficiency || 0,
            comments: data.technicalDelivery.comments || ''
          },
          communication: {
            effectiveCommunication: data.communication.effectiveCommunication || 0,
            crossTeamCollaboration: data.communication.crossTeamCollaboration || 0,
            architectureInfluence: data.communication.architectureInfluence || 0,
            comments: data.communication.comments || ''
          }
        });
        setWriteup(data);
      } else {
        // If no existing calibration, reset ratings
        setRatings({
          technicalDelivery: {
            codeQuality: 0,
            timelinessOfDelivery: 0,
            architecturalProficiency: 0,
            comments: ''
          },
          communication: {
            effectiveCommunication: 0,
            crossTeamCollaboration: 0,
            architectureInfluence: 0,
            comments: ''
          }
        });
      }
    } catch (error) {
      console.error('Error fetching existing calibration:', error);
      // Reset ratings on error
      setRatings({
        technicalDelivery: {
          codeQuality: 0,
          timelinessOfDelivery: 0,
          architecturalProficiency: 0,
          comments: ''
        },
        communication: {
          effectiveCommunication: 0,
          crossTeamCollaboration: 0,
          architectureInfluence: 0,
          comments: ''
        }
      });
    }
  };

  const handleRatingChange = (category, field, value) => {
    const numValue = field !== 'comments' ? Number(value) || 0 : value;
    setRatings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: numValue
      }
    }));
  };

  const handleSubmit = async () => {
    if (!selectedEngineer) return;

    try {
      const response = await fetch('/api/calibration/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          engineerId: selectedEngineer.id,
          ratings
        }),
      });

      if (response.ok) {
        // Generate write-up after successful submission
        await generateWriteup(selectedEngineer.id);
        alert('Calibration submitted successfully!');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error submitting calibration');
      }
    } catch (error) {
      console.error('Error submitting ratings:', error);
      alert('Error submitting calibration. Please try again.');
    }
  };

  const generateWriteup = async (engineerId) => {
    try {
      const response = await fetch(`/api/calibration/writeup/${engineerId}`);
      if (response.ok) {
        const data = await response.json();
        setWriteup(data);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error generating write-up');
      }
    } catch (error) {
      console.error('Error generating write-up:', error);
      alert('Error generating write-up. Please try again.');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/calibration/export/${selectedEngineer.id}`);
      if (!response.ok) {
        throw new Error('Failed to export write-up');
      }
      
      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `${selectedEngineer.first_name}_${selectedEngineer.last_name}_calibration.docx`;

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting write-up:', error);
      alert('Failed to export write-up. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="calibration-page">
      <div className="page-header">
        <h2>Team Calibration</h2>
        <p>Evaluate and calibrate team performance</p>
      </div>

      <div className="calibration-container">
        <div className="engineers-list">
          <h3>Select Engineer</h3>
          {engineers.length === 0 ? (
            <div className="no-engineers">
              <p>No engineers found. Add an engineer to begin calibration.</p>
              <button onClick={() => navigate('/add-engineer')} className="add-engineer-button">
                Add Engineer
              </button>
            </div>
          ) : (
            <div className="engineers-grid">
              {engineers.map(engineer => (
                <div
                  key={engineer.id}
                  className={`engineer-card ${selectedEngineer?.id === engineer.id ? 'selected' : ''}`}
                  onClick={() => handleEngineerSelect(engineer)}
                >
                  <div className="engineer-info">
                    <h4>{engineer.first_name} {engineer.last_name}</h4>
                    <p>{engineer.current_role}</p>
                    <p className="department">{engineer.department}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedEngineer && (
          <div className="calibration-form">
            <div className="engineer-summary">
              <h3>Engineer Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <label>Name</label>
                  <span>{selectedEngineer.first_name} {selectedEngineer.last_name}</span>
                </div>
                <div className="summary-item">
                  <label>Start Date</label>
                  <span>{new Date(selectedEngineer.start_date).toLocaleDateString()}</span>
                </div>
                <div className="summary-item">
                  <label>Time in Role</label>
                  <span>{selectedEngineer.time_in_role} months</span>
                </div>
                <div className="summary-item">
                  <label>Last Year Rating</label>
                  <span>{selectedEngineer.last_year_rating || 'N/A'}</span>
                </div>
                <div className="summary-item">
                  <label>Current Role</label>
                  <span>{selectedEngineer.current_role}</span>
                </div>
                <div className="summary-item">
                  <label>Current Level</label>
                  <span>{selectedEngineer.current_level}</span>
                </div>
              </div>
            </div>

            <div className="calibration-section">
              <h3>Technical Delivery</h3>
              <div className="rating-fields">
                <div className="rating-field">
                  <label>Code Quality</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={ratings.technicalDelivery.codeQuality || ''}
                    onChange={(e) => handleRatingChange('technicalDelivery', 'codeQuality', e.target.value)}
                  />
                </div>
                <div className="rating-field">
                  <label>Timeliness of Delivery</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={ratings.technicalDelivery.timelinessOfDelivery || ''}
                    onChange={(e) => handleRatingChange('technicalDelivery', 'timelinessOfDelivery', e.target.value)}
                  />
                </div>
                <div className="rating-field">
                  <label>Architectural Proficiency</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={ratings.technicalDelivery.architecturalProficiency || ''}
                    onChange={(e) => handleRatingChange('technicalDelivery', 'architecturalProficiency', e.target.value)}
                  />
                </div>
                <div className="rating-field">
                  <label>Comments</label>
                  <textarea
                    value={ratings.technicalDelivery.comments}
                    onChange={(e) => handleRatingChange('technicalDelivery', 'comments', e.target.value)}
                    placeholder="Enter comments about technical delivery..."
                  />
                </div>
              </div>
            </div>

            <div className="calibration-section">
              <h3>Communication</h3>
              <div className="rating-fields">
                <div className="rating-field">
                  <label>Effective Communication</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={ratings.communication.effectiveCommunication || ''}
                    onChange={(e) => handleRatingChange('communication', 'effectiveCommunication', e.target.value)}
                  />
                </div>
                <div className="rating-field">
                  <label>Cross Team Collaboration</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={ratings.communication.crossTeamCollaboration || ''}
                    onChange={(e) => handleRatingChange('communication', 'crossTeamCollaboration', e.target.value)}
                  />
                </div>
                <div className="rating-field">
                  <label>Architecture Influence</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={ratings.communication.architectureInfluence || ''}
                    onChange={(e) => handleRatingChange('communication', 'architectureInfluence', e.target.value)}
                  />
                </div>
                <div className="rating-field">
                  <label>Comments</label>
                  <textarea
                    value={ratings.communication.comments}
                    onChange={(e) => handleRatingChange('communication', 'comments', e.target.value)}
                    placeholder="Enter comments about communication..."
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button onClick={handleSubmit} className="submit-button">
                Submit Calibration
              </button>
              {writeup && (
                <button onClick={() => generateWriteup(selectedEngineer.id)} className="generate-writeup-button">
                  Regenerate Write-up
                </button>
              )}
            </div>

            {writeup && (
              <div className="writeup-section">
                <h3>Calibration Write-up</h3>
                <div className="writeup-content">
                  <p className="writeup-summary">{writeup.summary}</p>
                  <div className="writeup-details">
                    <h4>Technical Delivery</h4>
                    <p><strong>Code Quality:</strong> {writeup.technicalDelivery.codeQuality}/5</p>
                    <p><strong>Timeliness of Delivery:</strong> {writeup.technicalDelivery.timelinessOfDelivery}/5</p>
                    <p><strong>Architectural Proficiency:</strong> {writeup.technicalDelivery.architecturalProficiency}/5</p>
                    {writeup.technicalDelivery.comments && (
                      <p><strong>Comments:</strong> {writeup.technicalDelivery.comments}</p>
                    )}
                    
                    <h4>Communication</h4>
                    <p><strong>Effective Communication:</strong> {writeup.communication.effectiveCommunication}/5</p>
                    <p><strong>Cross Team Collaboration:</strong> {writeup.communication.crossTeamCollaboration}/5</p>
                    <p><strong>Architecture Influence:</strong> {writeup.communication.architectureInfluence}/5</p>
                    {writeup.communication.comments && (
                      <p><strong>Comments:</strong> {writeup.communication.comments}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {writeup && (
              <div className="write-up-section">
                <div className="write-up-header">
                  <h2>Performance Write-up</h2>
                  <button 
                    className="export-button"
                    onClick={handleExport}
                  >
                    Export as Word
                  </button>
                </div>
                <div className="write-up-content">
                  <div className="write-up-summary">
                    <h3>Summary</h3>
                    <p>{writeup.summary}</p>
                  </div>
                  <div className="write-up-details">
                    <div className="technical-delivery">
                      <h3>Technical Delivery</h3>
                      <p><strong>Code Quality:</strong> {writeup.technicalDelivery.codeQuality}/5</p>
                      <p><strong>Timeliness of Delivery:</strong> {writeup.technicalDelivery.timelinessOfDelivery}/5</p>
                      <p><strong>Architectural Proficiency:</strong> {writeup.technicalDelivery.architecturalProficiency}/5</p>
                      {writeup.technicalDelivery.comments && (
                        <p><strong>Comments:</strong> {writeup.technicalDelivery.comments}</p>
                      )}
                    </div>
                    <div className="communication">
                      <h3>Communication</h3>
                      <p><strong>Effective Communication:</strong> {writeup.communication.effectiveCommunication}/5</p>
                      <p><strong>Cross Team Collaboration:</strong> {writeup.communication.crossTeamCollaboration}/5</p>
                      <p><strong>Architecture Influence:</strong> {writeup.communication.architectureInfluence}/5</p>
                      {writeup.communication.comments && (
                        <p><strong>Comments:</strong> {writeup.communication.comments}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CalibrationPage; 