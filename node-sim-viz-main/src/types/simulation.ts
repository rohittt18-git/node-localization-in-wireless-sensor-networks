export interface Position {
  x: number;
  y: number;
}

export interface AnchorNode {
  id: string;
  position: Position;
}

export interface SimulationParams {
  noiseStdDev: number;
  pathLossN: number;
  pTx: number;
}

export interface RSSIReading {
  anchorId: string;
  trueDist: number;
  rssi: number;
  estDist: number;
}

export interface SimulationResult {
  targetTruePos: Position | null;
  targetPredictedPos: Position | null;
  error: number | null;
  runData: RSSIReading[];
}

export interface SavedRun {
  id: string;
  timestamp: string;
  userId: string;
  params: SimulationParams;
  targetTruePos: Position;
  targetPredictedPos: Position;
  error: number;
  runData: RSSIReading[];
}
