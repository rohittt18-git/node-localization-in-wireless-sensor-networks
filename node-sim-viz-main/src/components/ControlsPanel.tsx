import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SimulationParams } from '@/types/simulation';
import { Play, Save } from 'lucide-react';

interface ControlsPanelProps {
  params: SimulationParams;
  onParamsChange: (params: SimulationParams) => void;
  onRunSimulation: () => void;
  onSaveRun: () => void;
  canSave: boolean;
  isRunning: boolean;
  useApiModel: boolean;
  onUseApiModelChange: (value: boolean) => void;
}

export default function ControlsPanel({
  params,
  onParamsChange,
  onRunSimulation,
  onSaveRun,
  canSave,
  isRunning,
  useApiModel,
  onUseApiModelChange,
}: ControlsPanelProps) {
  return (
    <div className="h-full p-6 space-y-6 overflow-y-auto">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          Sensor Localization
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure simulation parameters and run localization
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Signal Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="noise" className="text-sm font-medium">
                Noise (X<sub>σ</sub>)
              </Label>
              <span className="text-sm text-muted-foreground">
                {params.noiseStdDev.toFixed(1)} dB
              </span>
            </div>
            <Slider
              id="noise"
              min={0}
              max={10}
              step={0.1}
              value={[params.noiseStdDev]}
              onValueChange={([value]) =>
                onParamsChange({ ...params, noiseStdDev: value })
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="pathLoss" className="text-sm font-medium">
                Path Loss (n)
              </Label>
              <span className="text-sm text-muted-foreground">
                {params.pathLossN.toFixed(1)}
              </span>
            </div>
            <Slider
              id="pathLoss"
              min={1.5}
              max={5}
              step={0.1}
              value={[params.pathLossN]}
              onValueChange={([value]) =>
                onParamsChange({ ...params, pathLossN: value })
              }
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pTx" className="text-sm font-medium">
              Reference RSSI (P<sub>tx</sub>)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="pTx"
                type="number"
                value={params.pTx}
                onChange={(e) =>
                  onParamsChange({ ...params, pTx: Number(e.target.value) })
                }
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">dBm</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Model Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="modelSwitch" className="text-sm font-medium">
                Use API Model
              </Label>
              <p className="text-xs text-muted-foreground">
                {useApiModel ? 'Server-side GNN' : 'Browser-side multilateration'}
              </p>
            </div>
            <Switch
              id="modelSwitch"
              checked={useApiModel}
              onCheckedChange={onUseApiModelChange}
              disabled
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            (API model currently disabled)
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button
          onClick={onRunSimulation}
          disabled={isRunning}
          className="w-full"
          size="lg"
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? 'Running...' : 'Run Simulation'}
        </Button>

        <Button
          onClick={onSaveRun}
          disabled={!canSave}
          variant="secondary"
          className="w-full"
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Run
        </Button>
      </div>
    </div>
  );
}
