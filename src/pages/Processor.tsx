import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Factory, Thermometer, Timer, Droplets, Wind } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProcessingBatch {
  id: string;
  batch_id: string;
  herb_name: string;
  quantity: number;
  stage: 'drying' | 'grinding' | 'packaging' | 'completed';
  temperature?: number;
  duration?: string;
  moisture_level?: number;
}

const Processor = () => {
  const [batches, setBatches] = useState<ProcessingBatch[]>([
    {
      id: '1',
      batch_id: 'ASH-2024-001',
      herb_name: 'Ashwagandha',
      quantity: 45,
      stage: 'drying',
      temperature: 45,
      duration: '72 hours',
      moisture_level: 12
    },
    {
      id: '2',
      batch_id: 'TUR-2024-002',
      herb_name: 'Turmeric',
      quantity: 32,
      stage: 'grinding',
      temperature: 25,
      duration: '4 hours',
      moisture_level: 8
    }
  ]);

  const [selectedBatch, setSelectedBatch] = useState<ProcessingBatch | null>(null);
  const [processingData, setProcessingData] = useState({
    method: '',
    temperature: '',
    duration: '',
    humidity: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const stageOrder = ['drying', 'grinding', 'packaging', 'completed'];
  const stageIcons = {
    drying: <Wind className="w-5 h-5" />,
    grinding: <Factory className="w-5 h-5" />,
    packaging: <Droplets className="w-5 h-5" />,
    completed: <div className="w-5 h-5 bg-success rounded-full flex items-center justify-center text-xs text-white">✓</div>
  };

  const getStageProgress = (stage: string) => {
    const index = stageOrder.indexOf(stage);
    return ((index + 1) / stageOrder.length) * 100;
  };

  const getNextStage = (currentStage: string) => {
    const currentIndex = stageOrder.indexOf(currentStage);
    return currentIndex < stageOrder.length - 1 ? stageOrder[currentIndex + 1] : null;
  };

  const advanceStage = async (batch: ProcessingBatch) => {
    const nextStage = getNextStage(batch.stage);
    if (!nextStage) return;

    if (!processingData.method || !processingData.temperature || !processingData.duration) {
      toast({
        title: "Missing Information",
        description: "Please fill all processing parameters",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-processing-event', {
        body: {
          batch_id: batch.batch_id,
          processing_method: processingData.method,
          temperature: parseFloat(processingData.temperature),
          duration: processingData.duration,
          humidity: processingData.humidity ? parseFloat(processingData.humidity) : null,
          notes: processingData.notes
        }
      });

      if (response.error) throw response.error;

      // Update local state
      setBatches(prev => prev.map(b => 
        b.id === batch.id ? { 
          ...b, 
          stage: nextStage as any,
          temperature: parseFloat(processingData.temperature),
          duration: processingData.duration
        } : b
      ));

      toast({
        title: "🏭 Stage Advanced!",
        description: `${batch.herb_name} moved to ${nextStage} stage`,
      });

      setSelectedBatch(null);
      setProcessingData({
        method: '',
        temperature: '',
        duration: '',
        humidity: '',
        notes: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to advance processing stage",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStageTimeline = (batch: ProcessingBatch) => {
    return (
      <div className="flex items-center justify-between mb-4">
        {stageOrder.map((stage, index) => {
          const isActive = stage === batch.stage;
          const isCompleted = stageOrder.indexOf(batch.stage) > index;
          const isNext = stageOrder.indexOf(batch.stage) + 1 === index;
          
          return (
            <div key={stage} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                ${isActive ? 'border-primary bg-primary text-white' : ''}
                ${isCompleted ? 'border-success bg-success text-white' : ''}
                ${!isActive && !isCompleted ? 'border-muted-foreground/30 bg-muted text-muted-foreground' : ''}
                ${isNext ? 'border-warning bg-warning/10 text-warning' : ''}
              `}>
                {stageIcons[stage as keyof typeof stageIcons]}
              </div>
              {index < stageOrder.length - 1 && (
                <div className={`w-12 h-0.5 mx-2 ${isCompleted ? 'bg-success' : 'bg-muted'}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-4xl font-bold text-primary mb-2">
            <Factory className="w-10 h-10 leaf-float" />
            Processing Plant
          </div>
          <p className="text-muted-foreground text-lg">Transform herbs through precise processing stages</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Processing Batches */}
          <div className="lg:col-span-2 space-y-6">
            {batches.map((batch) => (
              <Card key={batch.id} className="shadow-lg border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      {batch.herb_name} - {batch.batch_id}
                    </CardTitle>
                    <Badge variant="outline" className="text-sm">{batch.quantity} kg</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Stage Timeline */}
                  {renderStageTimeline(batch)}
                  
                  {/* Current Stage Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-primary/10 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Thermometer className="w-5 h-5 text-primary" />
                        <span className="font-semibold">Temperature</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">{batch.temperature || 'N/A'}°C</div>
                    </div>
                    <div className="p-4 bg-accent/20 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Timer className="w-5 h-5 text-accent" />
                        <span className="font-semibold">Duration</span>
                      </div>
                      <div className="text-2xl font-bold text-accent">{batch.duration || 'N/A'}</div>
                    </div>
                    <div className="p-4 bg-success/10 rounded-lg text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Droplets className="w-5 h-5 text-success" />
                        <span className="font-semibold">Moisture</span>
                      </div>
                      <div className="text-2xl font-bold text-success">{batch.moisture_level || 'N/A'}%</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Processing Progress</span>
                      <span>{Math.round(getStageProgress(batch.stage))}% Complete</span>
                    </div>
                    <Progress value={getStageProgress(batch.stage)} className="h-3" />
                  </div>

                  {/* Stage Visual */}
                  <div className="p-6 bg-gradient-to-r from-muted/50 to-muted/20 rounded-lg text-center">
                    <div className="text-6xl mb-2">
                      {batch.stage === 'drying' && '🌾'}
                      {batch.stage === 'grinding' && '⚙️'}
                      {batch.stage === 'packaging' && '📦'}
                      {batch.stage === 'completed' && '✅'}
                    </div>
                    <h3 className="text-xl font-semibold capitalize mb-1">{batch.stage}</h3>
                    <p className="text-muted-foreground text-sm">
                      {batch.stage === 'drying' && 'Herbs are being carefully dried to preserve potency'}
                      {batch.stage === 'grinding' && 'Dried herbs are being ground to fine powder'}
                      {batch.stage === 'packaging' && 'Final product is being packaged for distribution'}
                      {batch.stage === 'completed' && 'Processing complete - ready for quality testing'}
                    </p>
                  </div>

                  {getNextStage(batch.stage) && (
                    <Button 
                      onClick={() => setSelectedBatch(batch)}
                      className="w-full h-12 text-lg font-semibold"
                      variant="default"
                    >
                      Advance to {getNextStage(batch.stage)?.charAt(0).toUpperCase() + getNextStage(batch.stage)?.slice(1)} Stage
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Processing Form or Stats */}
          <div className="space-y-6">
            {selectedBatch ? (
              <Card className="shadow-lg border-2 border-warning/50">
                <CardHeader className="bg-gradient-to-r from-warning/10 to-accent/10">
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="w-5 h-5" />
                    Processing Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg">{selectedBatch.herb_name}</h3>
                    <p className="text-sm text-muted-foreground">Batch: {selectedBatch.batch_id}</p>
                    <p className="text-sm text-muted-foreground">
                      Advancing to: <span className="font-semibold capitalize">{getNextStage(selectedBatch.stage)}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Processing Method</Label>
                    <Select value={processingData.method} onValueChange={(value) => setProcessingData({...processingData, method: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select processing method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="air-drying">🌬️ Air Drying</SelectItem>
                        <SelectItem value="shade-drying">🏠 Shade Drying</SelectItem>
                        <SelectItem value="mechanical-grinding">⚙️ Mechanical Grinding</SelectItem>
                        <SelectItem value="cryogenic-grinding">❄️ Cryogenic Grinding</SelectItem>
                        <SelectItem value="vacuum-packaging">📦 Vacuum Packaging</SelectItem>
                        <SelectItem value="hermetic-sealing">🔒 Hermetic Sealing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature (°C)</Label>
                      <Input
                        id="temperature"
                        type="number"
                        placeholder="25"
                        value={processingData.temperature}
                        onChange={(e) => setProcessingData({...processingData, temperature: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        placeholder="4 hours"
                        value={processingData.duration}
                        onChange={(e) => setProcessingData({...processingData, duration: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="humidity">Humidity (%)</Label>
                    <Input
                      id="humidity"
                      type="number"
                      placeholder="45"
                      value={processingData.humidity}
                      onChange={(e) => setProcessingData({...processingData, humidity: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Processing Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Quality observations, conditions, or special handling notes..."
                      value={processingData.notes}
                      onChange={(e) => setProcessingData({...processingData, notes: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setSelectedBatch(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => advanceStage(selectedBatch)}
                      disabled={loading}
                      className="flex-1 bg-warning hover:bg-warning/90"
                    >
                      {loading ? "Processing..." : "Advance Stage"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Processing Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-primary/10 rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">15</div>
                      <div className="text-sm text-muted-foreground">Active Batches</div>
                    </div>
                    <div className="p-4 bg-success/10 rounded-lg text-center">
                      <div className="text-2xl font-bold text-success">847</div>
                      <div className="text-sm text-muted-foreground">kg Processed Today</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Processing Stages</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>🌬️ Drying</span>
                        <Badge variant="secondary">8 batches</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>⚙️ Grinding</span>
                        <Badge variant="secondary">4 batches</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>📦 Packaging</span>
                        <Badge variant="secondary">3 batches</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Processor;