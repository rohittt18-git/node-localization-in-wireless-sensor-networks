import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SimulationResult, SavedRun } from '@/types/simulation';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface DataPanelProps {
  result: SimulationResult;
  savedRuns: SavedRun[];
  onLoadRun: (run: SavedRun) => void;
}

export default function DataPanel({ result, savedRuns, onLoadRun }: DataPanelProps) {
  const getErrorColor = (error: number | null) => {
    if (error === null) return 'text-muted-foreground';
    if (error < 1) return 'text-success';
    if (error < 5) return 'text-warning';
    return 'text-error';
  };

  const getErrorIcon = (error: number | null) => {
    if (error === null) return null;
    if (error < 1) return <CheckCircle className="w-4 h-4" />;
    if (error < 5) return <AlertCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="h-full p-6 space-y-6 overflow-y-auto">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-foreground">Results & Data</h2>
        <p className="text-sm text-muted-foreground">
          Simulation output and history
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Localization Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">True Position:</span>
              <span className="font-mono text-foreground">
                {result.targetTruePos
                  ? `(${result.targetTruePos.x.toFixed(2)}, ${result.targetTruePos.y.toFixed(2)})`
                  : 'Not set'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Predicted Position:</span>
              <span className="font-mono text-foreground">
                {result.targetPredictedPos
                  ? `(${result.targetPredictedPos.x.toFixed(2)}, ${result.targetPredictedPos.y.toFixed(2)})`
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground">Localization Error:</span>
              <div className={`flex items-center gap-2 font-semibold ${getErrorColor(result.error)}`}>
                {getErrorIcon(result.error)}
                <span>
                  {result.error !== null ? `${result.error.toFixed(2)} m` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">RSSI Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium text-muted-foreground">Anchor</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">True Dist (m)</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">RSSI (dBm)</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Est Dist (m)</th>
                </tr>
              </thead>
              <tbody>
                {result.runData.length > 0 ? (
                  result.runData.map((data) => (
                    <tr key={data.anchorId} className="border-b border-border last:border-0">
                      <td className="py-2 font-mono text-foreground">{data.anchorId}</td>
                      <td className="text-right py-2 font-mono text-foreground">
                        {data.trueDist.toFixed(2)}
                      </td>
                      <td className="text-right py-2 font-mono text-foreground">
                        {data.rssi.toFixed(2)}
                      </td>
                      <td className="text-right py-2 font-mono text-foreground">
                        {data.estDist.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted-foreground">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Past Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {savedRuns.length > 0 ? (
              <div className="space-y-2">
                {savedRuns.map((run) => (
                  <button
                    key={run.id}
                    onClick={() => onLoadRun(run)}
                    className="w-full text-left p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(run.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <span className={`text-sm font-semibold ${getErrorColor(run.error)}`}>
                        {run.error.toFixed(2)} m
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No saved runs yet
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
