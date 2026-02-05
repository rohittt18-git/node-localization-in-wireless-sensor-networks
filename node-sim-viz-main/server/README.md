# Sensor Localization Server

Express API for the Wireless Sensor Node Localization Simulator.

## Setup

```bash
cd server
npm install
```

## Development

```bash
npm run dev
```

Server will start on http://localhost:3001

## Build

```bash
npm run build
npm start
```

## API Endpoints

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### POST /api/predict
Predict target node position using RSSI readings

**Request:**
```json
{
  "anchors": [
    { "id": "A1", "x": 10, "y": 10 },
    { "id": "A2", "x": 90, "y": 10 },
    { "id": "A3", "x": 90, "y": 90 },
    { "id": "A4", "x": 10, "y": 90 }
  ],
  "rssiReadings": [
    { "id": "A1", "rssi": -88.1 },
    { "id": "A2", "rssi": -85.2 },
    { "id": "A3", "rssi": -82.3 },
    { "id": "A4", "rssi": -86.5 }
  ],
  "params": {
    "pTx": -40,
    "n": 2.5
  }
}
```

**Response:**
```json
{
  "predictedPos": {
    "x": 50.5,
    "y": 50.1
  }
}
```

## Future Integration

The `/api/predict` endpoint currently uses a Linear Least Squares multilateration algorithm (Mock GNN).

When ready to integrate the real trained GNN model:

1. Set up a Python service that runs your trained GNN model
2. Modify the `/api/predict` endpoint to make HTTP requests to the Python service
3. The input/output format can remain the same

The placeholder comments in the code mark where changes need to be made.
