import { Position, AnchorNode, RSSIReading } from "@/types/simulation";

/**
 * Linear Least Squares (LLS) Multilateration
 * Solves the system of equations: (x - xi)^2 + (y - yi)^2 = ri^2
 * Using matrix operations: x = (A^T * A)^-1 * A^T * b
 */
export function multilateration(
  anchors: AnchorNode[],
  readings: RSSIReading[]
): Position {
  const n = anchors.length;
  
  if (n < 3) {
    throw new Error("At least 3 anchors are required for multilateration");
  }

  // Build the system of linear equations
  // Using the first anchor as reference
  const A: number[][] = [];
  const b: number[] = [];
  
  const x1 = anchors[0].position.x;
  const y1 = anchors[0].position.y;
  const r1 = readings[0].estDist;
  
  for (let i = 1; i < n; i++) {
    const xi = anchors[i].position.x;
    const yi = anchors[i].position.y;
    const ri = readings[i].estDist;
    
    // Linearized equation coefficients
    A.push([2 * (xi - x1), 2 * (yi - y1)]);
    
    const bi = r1 * r1 - ri * ri - x1 * x1 - y1 * y1 + xi * xi + yi * yi;
    b.push(bi);
  }
  
  // Solve using Least Squares: x = (A^T * A)^-1 * A^T * b
  const result = leastSquares(A, b);
  
  return {
    x: result[0],
    y: result[1],
  };
}

/**
 * Least Squares solver using matrix operations
 */
function leastSquares(A: number[][], b: number[]): number[] {
  // Calculate A^T
  const AT = transpose(A);
  
  // Calculate A^T * A
  const ATA = matrixMultiply(AT, A);
  
  // Calculate A^T * b
  const ATb = matrixVectorMultiply(AT, b);
  
  // Solve (A^T * A) * x = A^T * b
  return solve2x2(ATA, ATb);
}

/**
 * Matrix transpose
 */
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

/**
 * Matrix multiplication
 */
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

/**
 * Matrix-vector multiplication
 */
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

/**
 * Solve 2x2 linear system using Cramer's rule
 */
function solve2x2(A: number[][], b: number[]): number[] {
  const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
  
  if (Math.abs(det) < 1e-10) {
    throw new Error("Singular matrix - cannot solve");
  }
  
  const x = (b[0] * A[1][1] - b[1] * A[0][1]) / det;
  const y = (A[0][0] * b[1] - A[1][0] * b[0]) / det;
  
  return [x, y];
}
