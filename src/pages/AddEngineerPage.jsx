import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddEngineerPage.css';

function AddEngineerPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    current_role: '',
    current_level: '',
    department: '',
    start_date: '',
    time_in_role: '',
    last_year_rating: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user makes changes
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/engineers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/evaluation/${data.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error adding engineer');
      }
    } catch (error) {
      setError('Error connecting to server. Please try again.');
      console.error('Error adding engineer:', error);
    }
  };

  return (
    <div className="add-engineer-page">
      <div className="page-header">
        <h2>Add New Engineer</h2>
        <p>Enter engineer details to begin evaluation</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="engineer-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="current_role">Current Role</label>
            <input
              type="text"
              id="current_role"
              name="current_role"
              value={formData.current_role}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="current_level">Current Level</label>
            <input
              type="text"
              id="current_level"
              name="current_level"
              value={formData.current_level}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="start_date">Start Date</label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time_in_role">Time in Role (months)</label>
            <input
              type="number"
              id="time_in_role"
              name="time_in_role"
              value={formData.time_in_role}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_year_rating">Last Year Rating</label>
            <select
              id="last_year_rating"
              name="last_year_rating"
              value={formData.last_year_rating}
              onChange={handleChange}
              required
            >
              <option value="">Select Rating</option>
              <option value="Below Expectations">Below Expectations</option>
              <option value="Meets Expectations">Meets Expectations</option>
              <option value="Exceed Expectations">Exceed Expectations</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/calibration')} className="cancel-button">
            Back to Calibration
          </button>
          <button type="submit" className="submit-button">
            Add Engineer
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEngineerPage; 