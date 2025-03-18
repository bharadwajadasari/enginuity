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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch engineer details
        const engineerResponse = await fetch(`/api/engineers/${engineerId}`);
        const engineerData = await engineerResponse.json();
        setEngineer(engineerData);

        // Fetch evaluation criteria
        const criteriaResponse = await fetch('/api/evaluation-criteria');
        const criteriaData = await criteriaResponse.json();
        setCriteria(criteriaData);

        // Initialize scores and comments
        const initialScores = {};
        const initialComments = {};
        criteriaData.forEach(criterion => {
          initialScores[criterion.id] = 0;
          initialComments[criterion.id] = '';
        });
        setScores(initialScores);
        setComments(initialComments);
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
      [criterionId]: value
    }));
  };

  const handleCommentChange = (criterionId, value) => {
    setComments(prev => ({
      ...prev,
      [criterionId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/evaluations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          engineer_id: engineerId,
          scores,
          comments,
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
                value={scores[criterion.id]}
                onChange={(e) => handleScoreChange(criterion.id, parseFloat(e.target.value))}
              />
            </div>

            <div className="comment-input">
              <label>Comments:</label>
              <textarea
                value={comments[criterion.id]}
                onChange={(e) => handleCommentChange(criterion.id, e.target.value)}
                placeholder="Enter your evaluation comments..."
              />
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/calibration')} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Submit Evaluation
          </button>
        </div>
      </form>
    </div>
  );
}

export default EvaluationPage; 