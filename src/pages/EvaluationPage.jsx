import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EvaluationPage.css';

function EvaluationPage() {
  const { engineerId } = useParams();
  const navigate = useNavigate();
  const [engineer, setEngineer] = useState(null);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [generatingWriteup, setGeneratingWriteup] = useState(false);
  const [writeup, setWriteup] = useState(null);
  const [showWriteupModal, setShowWriteupModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch engineer details
        const engineerResponse = await fetch(`/api/engineers/${engineerId}`);
        const engineerData = await engineerResponse.json();
        setEngineer(engineerData);

        // Fetch evaluation criteria
        const criteriaResponse = await fetch('/api/evaluation/criteria');
        const criteriaData = await criteriaResponse.json();
        setCriteria(criteriaData);

        // Fetch existing evaluation scores
        const scoresResponse = await fetch(`/api/evaluation/${engineerId}`);
        const scoresData = await scoresResponse.json();
        console.log('Fetched evaluation data:', scoresData);
        
        if (scoresData && scoresData.scores && Object.keys(scoresData.scores).length > 0) {
          console.log('Setting existing scores:', scoresData.scores);
          setScores(scoresData.scores);
        } else {
          // Initialize empty scores if no existing evaluation
          console.log('No existing scores found, initializing empty scores');
          const initialScores = {};
          criteriaData.forEach(criterion => {
            initialScores[criterion.id] = { value: 0, comments: '' };
          });
          setScores(initialScores);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [engineerId]);

  const handleScoreChange = (criterionId, value) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        value: parseFloat(value)
      }
    }));
  };

  const handleCommentChange = (criterionId, value) => {
    setScores(prev => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        comments: value
      }
    }));
  };

  const handleGenerateWriteup = async () => {
    setGeneratingWriteup(true);
    setError(null);
    try {
      // Create a mapping of criteria IDs to names
      const criteriaMap = {};
      criteria.forEach(criterion => {
        criteriaMap[criterion.id] = criterion.name;
      });

      const scoresToSend = Object.entries(scores).reduce((acc, [id, score]) => {
        acc[criteriaMap[id]] = score.value;
        return acc;
      }, {});

      console.log('Sending scores for write-up:', scoresToSend);

      const response = await fetch('/api/evaluation/generate-writeup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scores: scoresToSend,
          engineerName: `${engineer.first_name} ${engineer.last_name}`,
          currentRole: engineer.current_role,
          department: engineer.department
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setWriteup(data.writeup);
        setShowWriteupModal(true);
      } else {
        console.error('Error generating write-up:', data);
        if (response.status === 503) {
          setError('The AI service is temporarily unavailable. Please try again later or contact your administrator.');
        } else {
          setError(data.message || 'Error generating write-up');
        }
      }
    } catch (error) {
      console.error('Error generating write-up:', error);
      setError('Failed to generate write-up. Please try again.');
    } finally {
      setGeneratingWriteup(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          engineer_id: engineerId,
          scores,
        }),
      });

      if (response.ok) {
        navigate('/calibration');
      } else {
        console.error('Error submitting evaluation');
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!engineer) {
    return <div className="error">Engineer not found</div>;
  }

  return (
    <div className="evaluation-page">
      <div className="page-header">
        <h2>Performance Evaluation</h2>
        <p>Evaluating {engineer.first_name} {engineer.last_name}</p>
      </div>

      <form onSubmit={handleSubmit} className="evaluation-form">
        <div className="criteria-grid">
          {criteria.map(criterion => (
            <div key={criterion.id} className="criterion-section">
              <h3>{criterion.name}</h3>
              <p className="criterion-description">{criterion.description}</p>
              <div className="criterion-weight">Weight: {criterion.weight * 100}%</div>
              
              <div className="score-input">
                <label>Score (0-5):</label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={scores[criterion.id]?.value || 0}
                  onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                />
              </div>

              <div className="comment-input">
                <label>Comments:</label>
                <textarea
                  value={scores[criterion.id]?.comments || ''}
                  onChange={(e) => handleCommentChange(criterion.id, e.target.value)}
                  placeholder="Enter your evaluation comments..."
                />
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/calibration')} className="cancel-button">
            Cancel
          </button>
          <button type="button" onClick={handleGenerateWriteup} className="generate-button" disabled={generatingWriteup}>
            {generatingWriteup ? 'Generating...' : 'Generate Write-up'}
          </button>
          <button type="submit" className="submit-button">
            Submit Evaluation
          </button>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </form>

      {showWriteupModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Generated Manager's Write-up</h3>
              <button onClick={() => setShowWriteupModal(false)} className="close-button">&times;</button>
            </div>
            <div className="writeup-content">
              {writeup && writeup.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowWriteupModal(false)} className="close-button">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvaluationPage; 