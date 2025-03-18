import express from 'express';
import { pool } from '../db/index.js';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

const router = express.Router();

// Test route to verify database connection and table existence
router.get('/test', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    res.json({ tables: result.rows });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get calibration write-up for an engineer
router.get('/writeup/:engineerId', async (req, res) => {
  const { engineerId } = req.params;

  try {
    // Get the most recent calibration for the engineer
    const result = await pool.query(
      `SELECT 
        cr.id,
        cr.evaluation_date,
        e.first_name,
        e.last_name,
        e.current_role,
        e.current_level,
        tdr.code_quality,
        tdr.timeliness_of_delivery,
        tdr.architectural_proficiency,
        tdr.comments as technical_comments,
        cr2.effective_communication,
        cr2.cross_team_collaboration,
        cr2.architecture_influence,
        cr2.comments as communication_comments
      FROM calibration_ratings cr
      JOIN engineers e ON cr.engineer_id = e.id
      JOIN technical_delivery_ratings tdr ON cr.id = tdr.calibration_rating_id
      JOIN communication_ratings cr2 ON cr.id = cr2.calibration_rating_id
      WHERE e.id = $1
      ORDER BY cr.evaluation_date DESC
      LIMIT 1`,
      [engineerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No calibration found for this engineer' });
    }

    const calibration = result.rows[0];
    
    // Generate the write-up
    const writeup = {
      engineer: `${calibration.first_name} ${calibration.last_name}`,
      role: calibration.current_role,
      level: calibration.current_level,
      evaluationDate: calibration.evaluation_date,
      technicalDelivery: {
        codeQuality: calibration.code_quality,
        timelinessOfDelivery: calibration.timeliness_of_delivery,
        architecturalProficiency: calibration.architectural_proficiency,
        comments: calibration.technical_comments
      },
      communication: {
        effectiveCommunication: calibration.effective_communication,
        crossTeamCollaboration: calibration.cross_team_collaboration,
        architectureInfluence: calibration.architecture_influence,
        comments: calibration.communication_comments
      },
      summary: generateSummary(calibration)
    };

    res.json(writeup);
  } catch (error) {
    console.error('Error generating write-up:', error);
    res.status(500).json({ message: 'Error generating write-up', error: error.message });
  }
});

// Helper function to generate a summary
function generateSummary(calibration) {
  // Convert potential null/undefined values to numbers, defaulting to 0
  const technicalAvg = (
    (Number(calibration.code_quality) || 0) +
    (Number(calibration.timeliness_of_delivery) || 0) +
    (Number(calibration.architectural_proficiency) || 0)
  ) / 3;

  const communicationAvg = (
    (Number(calibration.effective_communication) || 0) +
    (Number(calibration.cross_team_collaboration) || 0) +
    (Number(calibration.architecture_influence) || 0)
  ) / 3;

  const overallAvg = (technicalAvg + communicationAvg) / 2;

  // Ensure we have valid numbers for display
  const technicalScore = isNaN(technicalAvg) ? 0 : technicalAvg;
  const communicationScore = isNaN(communicationAvg) ? 0 : communicationAvg;
  const overallScore = isNaN(overallAvg) ? 0 : overallAvg;

  let performanceLevel = '';
  let performanceContext = '';
  
  if (overallScore >= 4.0) {
    performanceLevel = 'exceeding expectations';
    performanceContext = 'demonstrating exceptional performance';
  } else if (overallScore >= 3.0) {
    performanceLevel = 'meeting expectations';
    performanceContext = 'showing solid performance';
  } else if (overallScore >= 2.0) {
    performanceLevel = 'below expectations';
    performanceContext = 'requiring improvement in several areas';
  } else {
    performanceLevel = 'significantly below expectations';
    performanceContext = 'needing immediate attention and support';
  }

  const getPerformanceDescription = (avg) => {
    if (avg >= 4.0) return 'excellent';
    if (avg >= 3.0) return 'solid';
    if (avg >= 2.0) return 'inconsistent';
    return 'concerning';
  };

  return `${calibration.first_name} ${calibration.last_name} is currently ${performanceLevel} in their role as ${calibration.current_role} at ${calibration.current_level} level, ${performanceContext}. 
  Their technical delivery shows ${getPerformanceDescription(technicalScore)} performance (${technicalScore.toFixed(1)}/5 average), with particular strength in ${getStrongestArea(calibration, 'technical')}.
  In terms of communication and collaboration, they demonstrate ${getPerformanceDescription(communicationScore)} performance (${communicationScore.toFixed(1)}/5 average), with notable impact in ${getStrongestArea(calibration, 'communication')}.`;
}

function getStrongestArea(calibration, category) {
  if (category === 'technical') {
    const areas = [
      { name: 'code quality', value: Number(calibration.code_quality) || 0 },
      { name: 'timeliness of delivery', value: Number(calibration.timeliness_of_delivery) || 0 },
      { name: 'architectural proficiency', value: Number(calibration.architectural_proficiency) || 0 }
    ];
    return areas.reduce((a, b) => a.value > b.value ? a : b).name;
  } else {
    const areas = [
      { name: 'effective communication', value: Number(calibration.effective_communication) || 0 },
      { name: 'cross-team collaboration', value: Number(calibration.cross_team_collaboration) || 0 },
      { name: 'architecture influence', value: Number(calibration.architecture_influence) || 0 }
    ];
    return areas.reduce((a, b) => a.value > b.value ? a : b).name;
  }
}

// Submit calibration ratings
router.post('/ratings', async (req, res) => {
  const { engineerId, ratings } = req.body;

  try {
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert the main calibration record
      const calibrationResult = await client.query(
        `INSERT INTO calibration_ratings (
          engineer_id, evaluation_date
        ) VALUES ($1, CURRENT_DATE) RETURNING id`,
        [engineerId]
      );

      const calibrationId = calibrationResult.rows[0].id;

      // Insert technical delivery ratings
      await client.query(
        `INSERT INTO technical_delivery_ratings (
          calibration_rating_id, code_quality, timeliness_of_delivery,
          architectural_proficiency, comments
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          calibrationId,
          ratings.technicalDelivery.codeQuality,
          ratings.technicalDelivery.timelinessOfDelivery,
          ratings.technicalDelivery.architecturalProficiency,
          ratings.technicalDelivery.comments
        ]
      );

      // Insert communication ratings
      await client.query(
        `INSERT INTO communication_ratings (
          calibration_rating_id, effective_communication,
          cross_team_collaboration, architecture_influence, comments
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          calibrationId,
          ratings.communication.effectiveCommunication,
          ratings.communication.crossTeamCollaboration,
          ratings.communication.architectureInfluence,
          ratings.communication.comments
        ]
      );

      await client.query('COMMIT');
      res.status(201).json({ id: calibrationId, message: 'Calibration ratings submitted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Database error:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error submitting calibration ratings:', error);
    res.status(500).json({ message: 'Error submitting calibration ratings', error: error.message });
  }
});

// Export write-up as Word document
router.get('/export/:engineerId', async (req, res) => {
  try {
    // Get calibration data
    const calibrationResult = await pool.query(
      `SELECT 
        e.first_name,
        e.last_name,
        e.current_role,
        e.current_level,
        e.department,
        cr.evaluation_date,
        tdr.code_quality,
        tdr.timeliness_of_delivery,
        tdr.architectural_proficiency,
        tdr.comments as technical_comments,
        cmr.effective_communication,
        cmr.cross_team_collaboration,
        cmr.architecture_influence,
        cmr.comments as communication_comments
      FROM engineers e
      JOIN calibration_ratings cr ON e.id = cr.engineer_id
      JOIN technical_delivery_ratings tdr ON cr.id = tdr.calibration_rating_id
      JOIN communication_ratings cmr ON cr.id = cmr.calibration_rating_id
      WHERE e.id = $1
      ORDER BY cr.evaluation_date DESC
      LIMIT 1`,
      [req.params.engineerId]
    );

    if (calibrationResult.rows.length === 0) {
      return res.status(404).json({ message: 'No calibration found for this engineer' });
    }

    const calibration = calibrationResult.rows[0];

    // Get performance evaluation data
    const performanceResult = await pool.query(
      `SELECT 
        e.first_name,
        e.last_name,
        e.current_role,
        e.current_level,
        e.department,
        ev.evaluation_date,
        ev.overall_score,
        ev.performance_status,
        ev.promotion_readiness,
        ev.comments as evaluation_comments
      FROM engineers e
      JOIN evaluations ev ON e.id = ev.engineer_id
      WHERE e.id = $1
      ORDER BY ev.evaluation_date DESC
      LIMIT 1`,
      [req.params.engineerId]
    );

    // Create Word document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "Engineer Performance Evaluation",
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${calibration.first_name} ${calibration.last_name}`,
                bold: true,
              }),
              new TextRun({
                text: ` - ${calibration.current_role} (${calibration.current_level})`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Department: ${calibration.department}`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Evaluation Date: ${new Date(calibration.evaluation_date).toLocaleDateString()}`,
              }),
            ],
          }),
          new Paragraph({
            text: "Performance Summary",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: generateSummary(calibration),
              }),
            ],
          }),
          new Paragraph({
            text: "Calibration Ratings",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: "Technical Delivery",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Code Quality: ${calibration.code_quality}/5`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Timeliness of Delivery: ${calibration.timeliness_of_delivery}/5`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Architectural Proficiency: ${calibration.architectural_proficiency}/5`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Comments: ${calibration.technical_comments || 'No comments provided'}`,
              }),
            ],
          }),
          new Paragraph({
            text: "Communication",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Effective Communication: ${calibration.effective_communication}/5`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Cross-team Collaboration: ${calibration.cross_team_collaboration}/5`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Architecture Influence: ${calibration.architecture_influence}/5`,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Comments: ${calibration.communication_comments || 'No comments provided'}`,
              }),
            ],
          }),
        ],
      }],
    });

    // Add performance evaluation section if available
    if (performanceResult.rows.length > 0) {
      const performance = performanceResult.rows[0];
      doc.addSection({
        properties: {},
        children: [
          new Paragraph({
            text: "Performance Evaluation",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Evaluation Date: ${new Date(performance.evaluation_date).toLocaleDateString()}`,
              }),
            ],
          }),
          new Paragraph({
            text: "Detailed Assessment",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: performance.evaluation_comments || 'No detailed assessment available.',
              }),
            ],
          }),
          new Paragraph({
            text: "Performance Scores",
            heading: HeadingLevel.HEADING_3,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Overall Score: ${performance.overall_score}/5\nPerformance Status: ${performance.performance_status}\nPromotion Readiness: ${performance.promotion_readiness}`,
              }),
            ],
          }),
        ],
      });
    }

    // Generate the document
    const buffer = await Packer.toBuffer(doc);

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename=${calibration.first_name}_${calibration.last_name}_performance_evaluation.docx`);

    // Send the document
    res.send(buffer);
  } catch (error) {
    console.error('Error generating Word document:', error);
    res.status(500).json({ message: 'Error generating Word document' });
  }
});

export default router; 