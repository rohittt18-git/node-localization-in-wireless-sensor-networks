import { Position, AnchorNode, RSSIReading } from './types';

/**
 * Estimate distance from RSSI reading
 * Formula: d_est = 10^((P_TX - RSSI) / (10 * N))
 */
function estimateDistanceFromRSSI(
  rssi: number,
  pTx: number,
  n: number
): number {
  return Math.pow(10, (pTx - rssi) / (10 * n));
}

/**
 * Linear Least Squares (LLS) Multilateration
 * This is the "Mock GNN" implementation
 * 
 * TODO: Replace this with a call to the real GNN model
 * This will be done by making an HTTP request to a Python service
 * that runs the trained GNN model for more accurate predictions
 */
export function multilateration(
  anchors: AnchorNode[],
  readings: RSSIReading[],
  pTx: number,
  n: number
): Position {
  const numAnchors = anchors.length;
  
  if (numAnchors < 3) {
    throw new Error('At least 3 anchors are required for multilateration');
  }

  // Create a map for quick RSSI lookup
  const rssiMap = new Map<string, number>();
  readings.forEach(r => rssiMap.set(r.id, r.rssi));

  // Estimate distances from RSSI
  const distances = anchors.map(anchor => {
    const rssi = rssiMap.get(anchor.id);
    if (rssi === undefined) {
      throw new Error(`Missing RSSI reading for anchor ${anchor.id}`);
    }
    return estimateDistanceFromRSSI(rssi, pTx, n);
  });

  // Build the system of linear equations
  const A: number[][] = [];
  const b: number[] = [];
  
  const x1 = anchors[0].x;
  const y1 = anchors[0].y;
  const r1 = distances[0];
  
  for (let i = 1; i < numAnchors; i++) {
    const xi = anchors[i].x;
    const yi = anchors[i].y;
    const ri = distances[i];
    
    A.push([2 * (xi - x1), 2 * (yi - y1)]);
    
    const bi = r1 * r1 - ri * ri - x1 * x1 - y1 * y1 + xi * xi + yi * yi;
    b.push(bi);
  }
  
  // Solve using Least Squares
  const result = leastSquares(A, b);
  
  return {
    x: result[0],
    y: result[1],
  };
}

/**
 * Least Squares solver
 */
function leastSquares(A: number[][], b: number[]): number[] {
  const AT = transpose(A);
  const ATA = matrixMultiply(AT, A);
  const ATb = matrixVectorMultiply(AT, b);
  return solve2x2(ATA, ATb);
}

function transpose(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result: number[][] = [];
  
  for (let j = 0; j < cols; j++) {
    result[j] = [];
    for (let i = 0; i < rows; i++) {
      result[j][i] = matrix[i][j];
    }
  }
  
  return result;
}

function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const result: number[][] = [];
  
  for (let i = 0; i < rowsA; i++) {
    result[i] = [];
    for (let j = 0; j < colsB; j++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  
  return result;
}

function matrixVectorMultiply(A: number[][], b: number[]): number[] {
  const rows = A.length;
  const result: number[] = [];
  
  for (let i = 0; i < rows; i++) {
    let sum = 0;
    for (let j = 0; j < b.length; j++) {
      sum += A[i][j] * b[j];
    }
    result[i] = sum;
  }
  
  return result;
}

function solve2x2(A: number[][], b: number[]): number[] {
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  
  if (Math.abs(det) < 1e-10) {
    throw new Error('Singular matrix - cannot solve');
  }
  
  const x = (b[0] * A[1][1] - b[1] * A[0][1]) / det;
  const y = (A[0][0] * b[1] - A[1][0] * b[0]) / det;
  
  return [x, y];
}
