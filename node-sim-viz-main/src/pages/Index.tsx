import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import SimulationCanvas from '@/components/SimulationCanvas';
import ControlsPanel from '@/components/ControlsPanel';
import DataPanel from '@/components/DataPanel';
import { 
  Position, 
  AnchorNode, 
  SimulationParams, 
  SimulationResult,
  SavedRun 
} from '@/types/simulation';
import { generateRSSIReadings } from '@/lib/signalModel';
import { multilateration } from '@/lib/multilateration';
import { calculateDistance } from '@/lib/signalModel';
import { initializeAuth } from '@/lib/firebase';
import { saveSimulationRun, loadSimulationRuns } from '@/lib/firestoreService';

const ANCHORS: AnchorNode[] = [
  { id: 'A1', position: { x: 10, y: 10 } },
  { id: 'A2', position: { x: 90, y: 10 } },
  { id: 'A3', position: { x: 90, y: 90 } },
  { id: 'A4', position: { x: 10, y: 90 } },
];

const Index = () => {
  const [params, setParams] = useState<SimulationParams>({
    noiseStdDev: 4.0,
    pathLossN: 2.5,
    pTx: -40,
  });

  const [result, setResult] = useState<SimulationResult>({
    targetTruePos: null,
    targetPredictedPos: null,
    error: null,
    runData: [],
  });

  const [savedRuns, setSavedRuns] = useState<SavedRun[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [useApiModel, setUseApiModel] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeAuth();
        const runs = await loadSimulationRuns();
        setSavedRuns(runs);
      } catch (error) {
        console.error('Initialization error:', error);
        toast.error('Failed to initialize app. Check Firebase configuration.');
      }
    };
    init();
  }, []);

  const handleCanvasClick = (pos: Position) => {
    setResult({
      ...result,
      targetTruePos: pos,
      targetPredictedPos: null,
      error: null,
      runData: [],
    });
    toast.success(`Target position set: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`);
  };

  const handleRunSimulation = async () => {
    if (!result.targetTruePos) {
      toast.error('Please set target position by clicking on the canvas');
      return;
    }

    setIsRunning(true);

    try {
      // Generate noisy RSSI readings
      const readings = generateRSSIReadings(ANCHORS, result.targetTruePos, params);

      // Run multilateration (Mock GNN)
      const predictedPos = multilateration(ANCHORS, readings);

      // Calculate error
      const error = calculateDistance(result.targetTruePos, predictedPos);

      setResult({
        targetTruePos: result.targetTruePos,
        targetPredictedPos: predictedPos,
        error,
        runData: readings,
      });

      toast.success(`Simulation complete! Error: ${error.toFixed(2)} m`);
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Simulation failed. Check console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSaveRun = async () => {
    if (!result.targetTruePos || !result.targetPredictedPos || result.error === null) {
      toast.error('No simulation results to save');
      return;
    }

    try {
      await saveSimulationRun(
        params,
        result.targetTruePos,
        result.targetPredictedPos,
        result.error,
        result.runData
      );

      const runs = await loadSimulationRuns();
      setSavedRuns(runs);

      toast.success('Run saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save run. Check Firebase configuration.');
    }
  };

  const handleLoadRun = (run: SavedRun) => {
    setParams(run.params);
    setResult({
      targetTruePos: run.targetTruePos,
      targetPredictedPos: run.targetPredictedPos,
      error: run.error,
      runData: run.runData,
    });
    toast.success('Run loaded successfully!');
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Left Panel - Controls */}
      <div className="w-80 bg-card border-r border-border">
        <ControlsPanel
          params={params}
          onParamsChange={setParams}
          onRunSimulation={handleRunSimulation}
          onSaveRun={handleSaveRun}
          canSave={result.error !== null}
          isRunning={isRunning}
          useApiModel={useApiModel}
          onUseApiModelChange={setUseApiModel}
        />
      </div>

      {/* Center Panel - Canvas */}
      <div className="flex-1 bg-background">
        <SimulationCanvas
          anchors={ANCHORS}
          targetTruePos={result.targetTruePos}
          targetPredictedPos={result.targetPredictedPos}
          onCanvasClick={handleCanvasClick}
        />
      </div>

      {/* Right Panel - Data */}
      <div className="w-96 bg-card border-l border-border">
        <DataPanel
          result={result}
          savedRuns={savedRuns}
          onLoadRun={handleLoadRun}
        />
      </div>
    </div>
  );
};

export default Index;
