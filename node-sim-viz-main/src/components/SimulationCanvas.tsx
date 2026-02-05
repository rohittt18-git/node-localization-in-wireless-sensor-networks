import { useEffect, useRef } from 'react';
import { Position, AnchorNode } from '@/types/simulation';

interface SimulationCanvasProps {
  anchors: AnchorNode[];
  targetTruePos: Position | null;
  targetPredictedPos: Position | null;
  onCanvasClick: (pos: Position) => void;
}

const FIELD_SIZE = 100; // meters
const CANVAS_SIZE = 600; // pixels
const SCALE = CANVAS_SIZE / FIELD_SIZE;

export default function SimulationCanvas({
  anchors,
  targetTruePos,
  targetPredictedPos,
  onCanvasClick,
}: SimulationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get computed CSS variables
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const getHSLColor = (varName: string) => {
      const value = computedStyle.getPropertyValue(varName).trim();
      return `hsl(${value})`;
    };

    // Clear canvas
    ctx.fillStyle = getHSLColor('--canvas-background');
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid
    ctx.strokeStyle = getHSLColor('--canvas-grid');
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const pos = (i * FIELD_SIZE) / 10 * SCALE;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(CANVAS_SIZE, pos);
      ctx.stroke();
    }

    // Draw anchor nodes (green squares)
    ctx.fillStyle = getHSLColor('--anchor-node');
    anchors.forEach((anchor) => {
      const x = anchor.position.x * SCALE;
      const y = anchor.position.y * SCALE;
      ctx.fillRect(x - 8, y - 8, 16, 16);
      
      // Draw label
      ctx.fillStyle = getHSLColor('--foreground');
      ctx.font = '12px monospace';
      ctx.fillText(anchor.id, x + 12, y + 4);
      ctx.fillStyle = getHSLColor('--anchor-node');
    });

    // Draw true position (solid blue circle)
    if (targetTruePos) {
      ctx.fillStyle = getHSLColor('--true-node');
      ctx.beginPath();
      ctx.arc(
        targetTruePos.x * SCALE,
        targetTruePos.y * SCALE,
        10,
        0,
        2 * Math.PI
      );
      ctx.fill();
    }

    // Draw predicted position (red dashed circle)
    if (targetPredictedPos) {
      ctx.strokeStyle = getHSLColor('--predicted-node');
      ctx.lineWidth = 3;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(
        targetPredictedPos.x * SCALE,
        targetPredictedPos.y * SCALE,
        10,
        0,
        2 * Math.PI
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw error line
    if (targetTruePos && targetPredictedPos) {
      ctx.strokeStyle = getHSLColor('--warning');
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(targetTruePos.x * SCALE, targetTruePos.y * SCALE);
      ctx.lineTo(targetPredictedPos.x * SCALE, targetPredictedPos.y * SCALE);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [anchors, targetTruePos, targetPredictedPos]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / SCALE);
    const y = ((e.clientY - rect.top) / SCALE);

    onCanvasClick({ x, y });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-xl font-semibold mb-4 text-foreground">
        Simulation Canvas (100m × 100m)
      </h2>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        onClick={handleClick}
        className="border-2 border-border rounded-lg cursor-crosshair shadow-lg hover:border-primary transition-colors"
      />
      <p className="text-sm text-muted-foreground mt-4">
        Click anywhere to set the target node position
      </p>
      <div className="flex gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-anchor rounded"></div>
          <span className="text-foreground">Anchor Nodes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-trueNode rounded-full"></div>
          <span className="text-foreground">True Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-predictedNode rounded-full"></div>
          <span className="text-foreground">Predicted Position</span>
        </div>
      </div>
    </div>
  );
}
