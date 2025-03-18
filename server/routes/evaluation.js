import express from 'express';
import { pool } from '../db/index.js';
import OpenAI from 'openai';

const router = express.Router();

// Initialize OpenAI client with debug logging
console.log('Initializing OpenAI client...');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Test the API key configuration
console.log('OpenAI API Key configured:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');

// Get evaluation criteria
router.get('/criteria', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM evaluation_criteria ORDER BY category, weight DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching evaluation criteria:', error);
    res.status(500).json({ message: 'Error fetching evaluation criteria' });
  }
});

// Get evaluation scores for an engineer
router.get('/:engineerId', async (req, res) => {
  try {
    console.log('Fetching evaluation scores for engineer:', req.params.engineerId);
    const result = await pool.query(
      `SELECT 
        e.id as evaluation_id,
        e.overall_score,
        e.comments,
        es.criteria_id,
        es.score,
        es.comments as criteria_comments
      FROM evaluations e
      LEFT JOIN evaluation_scores es ON e.id = es.evaluation_id
      WHERE e.engineer_id = $1
      ORDER BY e.evaluation_date DESC
      LIMIT 1`,
      [req.params.engineerId]
    );

    console.log('Raw database result:', result.rows);

    if (result.rows.length === 0) {
      console.log('No evaluation found for engineer');
      return res.json({ scores: {} });
    }

    // Format the response
    const scores = {};
    result.rows.forEach(row => {
      if (row.criteria_id) {
        scores[row.criteria_id] = {
          value: row.score,
          comments: row.criteria_comments
        };
      }
    });

    const response = {
      id: result.rows[0].evaluation_id,
      overall_score: result.rows[0].overall_score,
      comments: result.rows[0].comments,
      scores
    };

    console.log('Formatted response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching evaluation scores:', error);
    res.status(500).json({ message: 'Error fetching evaluation scores' });
  }
});

// Generate manager's write-up
router.post('/generate-writeup', async (req, res) => {
  try {
    const { scores, engineerName, currentRole, department } = req.body;
    console.log('Generating write-up for:', { engineerName, currentRole, department });
    console.log('Raw scores received:', JSON.stringify(scores, null, 2));

    if (!scores || Object.keys(scores).length === 0) {
      console.error('No scores provided for write-up generation');
      return res.status(400).json({ message: 'No scores provided for write-up generation' });
    }

    // Format scores for the prompt
    const formattedScores = Object.entries(scores).map(([criterion, scoreData]) => {
      const scoreValue = typeof scoreData === 'object' ? scoreData.value : scoreData;
      return `${criterion}: ${scoreValue}/5`;
    }).join('\n');

    console.log('Formatted scores for prompt:', formattedScores);

    // Prepare the prompt for the LLM
    const prompt = `Generate a professional performance evaluation write-up for ${engineerName}, a ${currentRole} in the ${department} department. 
    Based on the following evaluation scores:

    ${formattedScores}

    Please provide a comprehensive write-up that:
    1. Summarizes overall performance
    2. Highlights key strengths
    3. Identifies areas for improvement
    4. Provides specific examples from the evaluation
    5. Maintains a professional and constructive tone
    6. Includes specific recommendations for growth

    Format the response in a clear, structured manner with appropriate sections.`;

    console.log('Sending request to OpenAI with model: gpt-4-turbo-preview');
    console.log('API Key configured:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
    console.log('API Key length:', process.env.OPENAI_API_KEY?.length);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are an experienced engineering manager writing a performance evaluation. Be specific, constructive, and professional in your feedback."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const writeup = completion.choices[0].message.content;
      console.log('Successfully generated write-up');
      res.json({ writeup });
    } catch (apiError) {
      console.error('OpenAI API Error:', {
        message: apiError.message,
        type: apiError.type,
        code: apiError.code,
        status: apiError.status,
        response: apiError.response?.data,
        stack: apiError.stack
      });
      throw apiError;
    }
  } catch (error) {
    console.error('Error generating write-up:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
      status: error.response?.status,
      type: error.type,
      code: error.code
    });

    // Check for specific OpenAI API errors
    if (error.response?.status === 429) {
      console.error('OpenAI API Quota Error:', {
        message: error.message,
        response: error.response.data
      });
      return res.status(503).json({ 
        message: 'The AI service is currently unavailable due to quota limits. Please try again later or contact your administrator.',
        error: 'Service temporarily unavailable'
      });
    }

    if (error.response?.status === 401) {
      console.error('OpenAI API Authentication Error:', {
        message: error.message,
        response: error.response.data
      });
      return res.status(500).json({ 
        message: 'There was an issue with the AI service authentication. Please contact your administrator.',
        error: 'Authentication error'
      });
    }

    res.status(500).json({ 
      message: 'Error generating write-up', 
      error: error.message,
      details: error.response?.data
    });
  }
});

// Submit evaluation
router.post('/', async (req, res) => {
  const { engineer_id, scores, comments } = req.body;
  console.log('Received evaluation submission:', { engineer_id, scores, comments });

  try {
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert the main evaluation record
      const evaluationResult = await client.query(
        `INSERT INTO evaluations (
          engineer_id, evaluation_date, overall_score,
          performance_status, promotion_readiness, comments
        ) VALUES ($1, CURRENT_DATE, $2, $3, $4, $5) RETURNING id`,
        [engineer_id, 0, 'In Progress', 'Not Ready', comments]
      );

      const evaluationId = evaluationResult.rows[0].id;
      console.log('Created evaluation record with ID:', evaluationId);

      // Insert individual scores
      let totalScore = 0;
      for (const [criteriaId, score] of Object.entries(scores)) {
        console.log('Inserting score for criteria:', criteriaId, score);
        await client.query(
          `INSERT INTO evaluation_scores (
            evaluation_id, criteria_id, score, comments
          ) VALUES ($1, $2, $3, $4)`,
          [evaluationId, criteriaId, score.value, score.comments]
        );
        totalScore += score.value;
      }

      // Update the overall score
      const avgScore = totalScore / Object.keys(scores).length;
      await client.query(
        'UPDATE evaluations SET overall_score = $1 WHERE id = $2',
        [avgScore, evaluationId]
      );

      await client.query('COMMIT');
      console.log('Successfully saved evaluation with average score:', avgScore);
      res.status(201).json({ id: evaluationId, overall_score: avgScore });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in transaction:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    res.status(500).json({ message: 'Error submitting evaluation' });
  }
});

export default router; 