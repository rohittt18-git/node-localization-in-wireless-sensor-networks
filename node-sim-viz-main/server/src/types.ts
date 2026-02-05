export interface Position {
  x: number;
  y: number;
}

export interface AnchorNode {
  id: string;
  x: number;
  y: number;
}

export interface RSSIReading {
  id: string;
  rssi: number;
}

export interface PredictRequest {
  anchors: AnchorNode[];
  rssiReadings: RSSIReading[];
  params: {
    pTx: number;
    n: number;
  };
}

export interface PredictResponse {
  predictedPos: Position;
}
