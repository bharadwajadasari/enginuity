import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import engineersRouter from './routes/engineers.js';
import evaluationRouter from './routes/evaluation.js';
import calibrationRouter from './routes/calibration.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/engineers', engineersRouter);
app.use('/api/evaluation', evaluationRouter);
app.use('/api/calibration', calibrationRouter);

// Basic route for testing
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Enginuity API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 