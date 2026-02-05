import express, { Request, Response } from 'express';
import cors from 'cors';
import { multilateration } from './multilateration';
import { PredictRequest, PredictResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

/**
 * POST /api/predict
 * 
 * Predict target node position using RSSI readings from anchor nodes
 * 
 * Request body:
 * {
 *   "anchors": [{ "id": "A1", "x": 10, "y": 10 }, ...],
 *   "rssiReadings": [{ "id": "A1", "rssi": -88.1 }, ...],
 *   "params": { "pTx": -40, "n": 2.5 }
 * }
 * 
 * Response:
 * {
 *   "predictedPos": { "x": 50.5, "y": 50.1 }
 * }
 * 
 * TODO: Replace this with a call to the real GNN model
 * When ready, this endpoint should:
 * 1. Accept the same input format
 * 2. Make an HTTP request to a Python service running the trained GNN model
 * 3. Return the prediction from the real model
 */
app.post('/api/predict', (req: Request, res: Response) => {
  try {
    const { anchors, rssiReadings, params }: PredictRequest = req.body;

    // Validate input
    if (!anchors || !rssiReadings || !params) {
      return res.status(400).json({
        error: 'Missing required fields: anchors, rssiReadings, or params',
      });
    }

    if (anchors.length < 3) {
      return res.status(400).json({
        error: 'At least 3 anchors are required',
      });
    }

    // Run multilateration (Mock GNN)
    const predictedPos = multilateration(
      anchors,
      rssiReadings,
      params.pTx,
      params.n
    );

    const response: PredictResponse = {
      predictedPos,
    };

    res.json(response);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Predict endpoint: http://localhost:${PORT}/api/predict`);
});
