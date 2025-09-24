import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Truck, Scale, Camera, CheckCircle, Clock, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PendingHarvest {
  id: string;
  herb_name: string;
  farmer_name: string;
  farmer_location: string;
  quantity: number;
  harvest_date: string;
  batch_id: string;
  status: 'pending' | 'collected' | 'verified';
}

const Collector = () => {
  const [pendingHarvests, setPendingHarvests] = useState<PendingHarvest[]>([
    {
      id: '1',
      herb_name: 'Ashwagandha',
      farmer_name: 'Ravi Kumar',
      farmer_location: 'Jaipur District, Rajasthan',
      quantity: 45,
      harvest_date: '2024-01-15',
      batch_id: 'ASH-2024-001',
      status: 'pending'
    },
    {
      id: '2',
      herb_name: 'Turmeric',
      farmer_name: 'Priya Sharma',
      farmer_location: 'Udaipur, Rajasthan',
      quantity: 32,
      harvest_date: '2024-01-14',
      batch_id: 'TUR-2024-002',
      status: 'pending'
    }
  ]);
  
  const [selectedHarvest, setSelectedHarvest] = useState<PendingHarvest | null>(null);
  const [collectionData, setCollectionData] = useState({
    actualWeight: '',
    condition: 'excellent',
    notes: '',
    photo: null as File | null
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCollectionConfirm = async (harvest: PendingHarvest) => {
    if (!collectionData.actualWeight) {
      toast({
        title: "Weight Required",
        description: "Please enter the actual weight measured",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-processing-event', {
        body: {
          batch_id: harvest.batch_id,
          processing_method: 'collection',
          temperature: null,
          duration: null,
          actual_weight: parseFloat(collectionData.actualWeight),
          condition: collectionData.condition,
          notes: collectionData.notes
        }
      });

      if (response.error) throw response.error;

      // Update local state
      setPendingHarvests(prev => prev.map(h => 
        h.id === harvest.id ? { ...h, status: 'collected' as const } : h
      ));

      toast({
        title: "🚚 Collection Confirmed!",
        description: `${harvest.herb_name} batch collected successfully`,
      });

      setSelectedHarvest(null);
      setCollectionData({
        actualWeight: '',
        condition: 'excellent',
        notes: '',
        photo: null
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to confirm collection",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'pending': return 40;
      case 'collected': return 70;
      case 'verified': return 100;
      default: return 0;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="w-3 h-3" /> Awaiting Collection</Badge>;
      case 'collected':
        return <Badge variant="default" className="flex items-center gap-1 bg-warning"><Truck className="w-3 h-3" /> Collected</Badge>;
      case 'verified':
        return <Badge variant="default" className="flex items-center gap-1 bg-success"><CheckCircle className="w-3 h-3" /> Verified</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-4xl font-bold text-primary mb-2">
            <Truck className="w-10 h-10 leaf-float" />
            Collector Portal
          </div>
          <p className="text-muted-foreground text-lg">Aggregate and verify herb collections from farmers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Collections */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-6 h-6" />
                  Pending Collections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingHarvests.map((harvest) => (
                  <Card key={harvest.id} className="border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">{harvest.herb_name}</h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Farmer: {harvest.farmer_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {harvest.farmer_location}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(harvest.status)}
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                        <div className="text-center p-3 bg-primary/10 rounded-lg">
                          <div className="font-bold text-lg">{harvest.quantity} kg</div>
                          <div className="text-muted-foreground">Reported Weight</div>
                        </div>
                        <div className="text-center p-3 bg-secondary/50 rounded-lg">
                          <div className="font-bold text-lg">{harvest.batch_id}</div>
                          <div className="text-muted-foreground">Batch ID</div>
                        </div>
                        <div className="text-center p-3 bg-accent/20 rounded-lg">
                          <div className="font-bold text-lg">{new Date(harvest.harvest_date).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">Harvest Date</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Supply Chain Progress</span>
                          <span>{getProgressValue(harvest.status)}% Complete</span>
                        </div>
                        <Progress value={getProgressValue(harvest.status)} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Harvest</span>
                          <span>Collection</span>
                          <span>Processing</span>
                          <span>Quality Test</span>
                          <span>Complete</span>
                        </div>
                      </div>

                      {harvest.status === 'pending' && (
                        <Button 
                          onClick={() => setSelectedHarvest(harvest)}
                          className="w-full"
                          variant="default"
                        >
                          Confirm Collection
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Collection Form or Stats */}
          <div className="space-y-6">
            {selectedHarvest ? (
              <Card className="shadow-lg border-2 border-warning/50">
                <CardHeader className="bg-gradient-to-r from-warning/10 to-accent/10">
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Confirm Collection
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg">{selectedHarvest.herb_name}</h3>
                    <p className="text-sm text-muted-foreground">Batch: {selectedHarvest.batch_id}</p>
                    <p className="text-sm text-muted-foreground">Reported: {selectedHarvest.quantity} kg</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="actualWeight">Actual Weight (kg) *</Label>
                    <Input
                      id="actualWeight"
                      type="number"
                      placeholder="Measured weight"
                      value={collectionData.actualWeight}
                      onChange={(e) => setCollectionData({...collectionData, actualWeight: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Condition Assessment</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {['excellent', 'good', 'fair', 'poor'].map(condition => (
                        <Button
                          key={condition}
                          variant={collectionData.condition === condition ? "default" : "outline"}
                          onClick={() => setCollectionData({...collectionData, condition})}
                          className="justify-start"
                        >
                          {condition === 'excellent' && '🌟 Excellent'}
                          {condition === 'good' && '✅ Good'}
                          {condition === 'fair' && '⚠️ Fair'}
                          {condition === 'poor' && '❌ Poor'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Collection Photo</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setCollectionData({...collectionData, photo: e.target.files[0]});
                          }
                        }}
                        className="hidden"
                        id="collection-photo"
                      />
                      <label htmlFor="collection-photo" className="cursor-pointer">
                        <Camera className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm">
                          {collectionData.photo ? collectionData.photo.name : "Upload collection photo"}
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Collection Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any observations or notes about the collection..."
                      value={collectionData.notes}
                      onChange={(e) => setCollectionData({...collectionData, notes: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setSelectedHarvest(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleCollectionConfirm(selectedHarvest)}
                      disabled={loading}
                      className="flex-1 bg-warning hover:bg-warning/90"
                    >
                      {loading ? "Confirming..." : "Confirm Collection"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Collection Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-success/10 rounded-lg">
                      <div className="text-2xl font-bold text-success">47</div>
                      <div className="text-sm text-muted-foreground">Collections Today</div>
                    </div>
                    <div className="p-4 bg-warning/10 rounded-lg">
                      <div className="text-2xl font-bold text-warning">1,240</div>
                      <div className="text-sm text-muted-foreground">Total kg Collected</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Collection Routes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>📍 Jaipur District</span>
                        <Badge variant="secondary">12 farms</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>📍 Udaipur Region</span>
                        <Badge variant="secondary">8 farms</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>📍 Jodhpur Area</span>
                        <Badge variant="secondary">15 farms</Badge>
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

export default Collector;