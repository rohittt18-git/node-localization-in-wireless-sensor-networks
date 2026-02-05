# Wireless Sensor Node Localization Simulator

A full-stack web application for simulating and visualizing wireless sensor node localization using RSSI-based multilateration.

## Overview

This application simulates the localization of a target node using RSSI (Received Signal Strength Indicator) measurements from multiple anchor nodes. It features:

- **Interactive 2D Canvas**: Click to place target nodes and visualize localization results
- **Signal Simulation**: Configurable noise and path loss parameters using the Log-Normal Shadowing Model
- **Mock GNN Algorithm**: Linear Least Squares multilateration for position prediction
- **Firebase Integration**: Save and load simulation runs from Firestore
- **Express API**: Ready for future integration with real trained GNN models

## Project Structure

```
/
├── client/                 # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── lib/          # Core logic (signal model, multilateration)
│   │   ├── types/        # TypeScript types
│   │   └── pages/        # Main application page
│   └── ...
│
├── server/                # Node.js backend (Express + TypeScript)
│   ├── src/
│   │   ├── index.ts      # Express server
│   │   ├── multilateration.ts  # Mock GNN implementation
│   │   └── types.ts      # API types
│   └── ...
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project (for database functionality)

### Client Setup

1. Navigate to the project root:
```bash
npm install
```

2. Configure Firebase:
   - Open `src/lib/firebase.ts`
   - Replace the placeholder config with your Firebase project credentials

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

### Server Setup

1. Navigate to the server directory:
```bash
cd server
npm install
```

2. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## Features

### Signal Model

The application uses the **Log-Normal Shadowing Model** to simulate realistic RSSI measurements:

```
RSSI = P_TX - 10 * n * log10(d) + X_σ
```

Where:
- `P_TX`: Reference RSSI at 1 meter (default: -40 dBm)
- `n`: Path loss exponent (default: 2.5)
- `d`: True distance between nodes
- `X_σ`: Gaussian noise with std dev (default: 4.0 dB)

### Localization Algorithm

The Mock GNN uses **Linear Least Squares (LLS) Multilateration**:

1. Estimate distances from noisy RSSI values
2. Linearize the system of equations: `(x - xi)² + (y - yi)² = ri²`
3. Solve using matrix operations: `x = (A^T * A)^(-1) * A^T * b`

### UI Components

- **Controls Panel (Left)**: Configure signal parameters and run simulations
- **Simulation Canvas (Center)**: Interactive 100m × 100m field with visual feedback
- **Data Panel (Right)**: View results, RSSI data table, and past runs

### Firebase Integration

All simulation runs are saved to Firestore with:
- Timestamp and user ID
- Simulation parameters
- True and predicted positions
- Localization error
- Complete RSSI data

## API Documentation

### POST /api/predict

Predict target position using RSSI readings (prepared for future GNN integration).

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

## Future Enhancements

The application is designed for easy integration with a real trained GNN model:

1. Deploy your Python GNN model as a microservice
2. Update the `/api/predict` endpoint to call the Python service
3. Enable the "Use API Model" toggle in the UI

Look for `TODO: Replace this with a call to the real GNN model` comments in the code.

## Technologies

**Frontend:**
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Canvas API for visualization
- Firebase for authentication and database

**Backend:**
- Node.js with Express
- TypeScript for type safety
- CORS enabled for cross-origin requests

## License

This project was built with Lovable.
