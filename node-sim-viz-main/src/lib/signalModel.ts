import { Position, AnchorNode, SimulationParams, RSSIReading } from "@/types/simulation";

/**
 * Generate a random value from a Gaussian (Normal) distribution
 * Using Box-Muller transform
 */
export function randomGaussian(mean: number = 0, stdDev: number = 1): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Calculate Euclidean distance between two positions
 */
export function calculateDistance(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Generate noisy RSSI reading using Log-Normal Shadowing Model
 * Formula: RSSI = P_TX - 10 * N * log10(d) + X_sigma
 */
export function generateNoisyRSSI(
  distance: number,
  params: SimulationParams
): number {
  const { pTx, pathLossN, noiseStdDev } = params;
  const pathLoss = 10 * pathLossN * Math.log10(distance);
  const noise = randomGaussian(0, noiseStdDev);
  return pTx - pathLoss + noise;
}

/**
 * Estimate distance from RSSI reading (inverse of the formula, without noise)
 * Formula: d_est = 10^((P_TX - RSSI) / (10 * N))
 */
export function estimateDistanceFromRSSI(
  rssi: number,
  params: SimulationParams
): number {
  const { pTx, pathLossN } = params;
  return Math.pow(10, (pTx - rssi) / (10 * pathLossN));
}

/**
 * Generate RSSI readings for all anchors
 */
export function generateRSSIReadings(
  anchors: AnchorNode[],
  targetPos: Position,
  params: SimulationParams
): RSSIReading[] {
  return anchors.map((anchor) => {
    const trueDist = calculateDistance(anchor.position, targetPos);
    const rssi = generateNoisyRSSI(trueDist, params);
    const estDist = estimateDistanceFromRSSI(rssi, params);
    
    return {
      anchorId: anchor.id,
      trueDist,
      rssi,
      estDist,
    };
  });
}
