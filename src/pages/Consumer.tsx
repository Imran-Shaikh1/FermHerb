import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { QrCode, Scan, Sparkles, Camera, Search } from "lucide-react";
import StoryTimeline from "@/components/StoryTimeline";

interface TimelineEvent {
  id: string;
  type: 'harvest' | 'collection' | 'processing' | 'laboratory' | 'manufacturing';
  title: string;
  actor: {
    name: string;
    location: string;
    photo?: string;
  };
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  metadata: Record<string, any>;
  photos?: string[];
  gpsCoordinates?: { lat: number; lng: number };
}

const Consumer = () => {
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [provenance, setProvenance] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showStory, setShowStory] = useState(false);
  const { toast } = useToast();

  // Mock story data for demonstration
  const mockStoryEvents: TimelineEvent[] = [
    {
      id: '1',
      type: 'harvest',
      title: 'Sacred Harvest by Ramesh Kumar',
      actor: {
        name: 'Ramesh Kumar',
        location: 'Kerala, India'
      },
      timestamp: new Date('2024-01-15'),
      status: 'completed',
      metadata: {
        quantity: '500 kg',
        harvest_method: 'Hand Picking',
        weather: 'Sunny, 28°C',
        soil_ph: '6.8'
      },
      gpsCoordinates: { lat: 10.8505, lng: 76.2711 }
    },
    {
      id: '2',
      type: 'collection',
      title: 'Quality Collection & Weighing',
      actor: {
        name: 'Priya Collectors Ltd',
        location: 'Kochi, Kerala'
      },
      timestamp: new Date('2024-01-16'),
      status: 'completed',
      metadata: {
        collected_weight: '485 kg',
        quality_grade: 'Grade A',
        moisture_check: 'Passed',
        transport_vehicle: 'KL-07-2345'
      }
    },
    {
      id: '3',
      type: 'processing',
      title: 'Traditional Drying & Processing',
      actor: {
        name: 'Ayur Processing Center',
        location: 'Thrissur, Kerala'
      },
      timestamp: new Date('2024-01-18'),
      status: 'completed',
      metadata: {
        processing_method: 'Solar Drying',
        temperature: '45°C',
        duration: '48 hours',
        final_weight: '95 kg'
      }
    },
    {
      id: '4',
      type: 'laboratory',
      title: 'Scientific Quality Verification',
      actor: {
        name: 'Kerala Ayurveda Labs',
        location: 'Thiruvananthapuram, Kerala'
      },
      timestamp: new Date('2024-01-22'),
      status: 'completed',
      metadata: {
        moisture_content: '8.5%',
        pesticide_residue: 'Not Detected',
        dna_authenticity: 'Confirmed',
        heavy_metals: 'Within Limits'
      }
    },
    {
      id: '5',
      type: 'manufacturing',
      title: 'Premium Product Creation',
      actor: {
        name: 'Sacred Origins Mfg',
        location: 'Bangalore, Karnataka'
      },
      timestamp: new Date('2024-01-25'),
      status: 'completed',
      metadata: {
        product_name: 'Ashwagandha Premium Capsules',
        batch_size: '1000 bottles',
        expiry_date: '2026-01-25',
        certification: 'Organic & GMP'
      }
    }
  ];

  const handleQRScan = async () => {
    if (!batchId.trim()) {
      toast({
        title: "Missing Batch ID",
        description: "Please enter a batch ID to trace",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-provenance', {
        body: { batchId }
      });

      if (error) throw error;

      setProvenance(data);
      setShowStory(true);
      setCurrentStep(0);

      toast({
        title: "Story Unlocked! ✨",
        description: "Discover the sacred journey of your herb",
      });

      // Add celebration animation
      const celebration = document.createElement('div');
      celebration.innerHTML = '🌿';
      celebration.className = 'celebrate-leaves fixed top-0 left-1/2 text-4xl z-50';
      document.body.appendChild(celebration);
      setTimeout(() => document.body.removeChild(celebration), 3000);

    } catch (error: any) {
      // Show demo story for any batch ID
      setProvenance({ events: mockStoryEvents });
      setShowStory(true);
      setCurrentStep(0);
      
      toast({
        title: "Demo Story Loaded! ✨", 
        description: "Experience the sacred journey (demo mode)",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showStory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-background via-earth-background to-nature-background p-6">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gold mb-2">Sacred Journey</h1>
              <p className="text-muted-foreground">Batch ID: {batchId || 'DEMO-ASH-001'}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowStory(false)}
              className="border-gold text-gold hover:bg-gold/10"
            >
              Scan New Product
            </Button>
          </div>
          
          <StoryTimeline 
            events={mockStoryEvents}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-background via-earth-background to-nature-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] repeat"></div>
        </div>

        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-6 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-gold font-medium">Premium Traceability Portal</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gold via-primary to-accent bg-clip-text text-transparent leading-tight">
              Discover Your Herb's Story
            </h1>
            
            <p className="text-xl md:text-2xl text-earth-dark/80 mb-4 font-light">
              Every QR code unlocks a sacred journey of authenticity and trust
            </p>
            
            <p className="text-lg text-earth-dark/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              Scan your product's QR code to experience an immersive story - from the farmer's hands 
              to laboratory verification to your wellness journey.
            </p>
          </div>
        </div>
      </div>

      {/* Scanning Interface */}
      <div className="container mx-auto px-6 pb-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-2xl border-gold/20 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gold to-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-gold/30">
                <QrCode className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-2xl text-gold">Sacred Origins Scanner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="batchId" className="text-lg font-medium">
                  Enter Batch ID or QR Code
                </Label>
                <Input
                  id="batchId"
                  placeholder="ASH-2024-001 or scan QR code..."
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="h-14 text-lg border-gold/30 focus:border-gold bg-input/50"
                  onKeyPress={(e) => e.key === 'Enter' && handleQRScan()}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  onClick={handleQRScan}
                  disabled={loading}
                  size="lg"
                  className="h-14 bg-gradient-to-r from-gold to-primary hover:from-gold/90 hover:to-primary/90 text-white shadow-lg shadow-gold/30"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Tracing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5" />
                      Trace Journey
                    </div>
                  )}
                </Button>

                <Button 
                  variant="outline"
                  size="lg"
                  className="h-14 border-gold text-gold hover:bg-gold/10 border-2"
                  onClick={() => {
                    setBatchId('DEMO-ASH-001');
                    setTimeout(() => handleQRScan(), 100);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Try Demo
                  </div>
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">✨ Experience the magic of transparency</p>
                <p>Each scan reveals the complete journey from farm to your hands</p>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 bg-card/60 rounded-xl border border-gold/20">
              <div className="w-12 h-12 bg-gradient-to-br from-success to-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-lg font-semibold text-gold mb-2">Meet Your Farmer</h3>
              <p className="text-muted-foreground text-sm">Connect with the hands that nurtured your herbs</p>
            </div>
            
            <div className="text-center p-6 bg-card/60 rounded-xl border border-gold/20">
              <div className="w-12 h-12 bg-gradient-to-br from-warning to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🧪</span>
              </div>
              <h3 className="text-lg font-semibold text-gold mb-2">Lab Verified</h3>
              <p className="text-muted-foreground text-sm">Scientific proof of purity and authenticity</p>
            </div>
            
            <div className="text-center p-6 bg-card/60 rounded-xl border border-gold/20">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-lg font-semibold text-gold mb-2">GPS Tracked</h3>
              <p className="text-muted-foreground text-sm">Every step mapped with precision</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Consumer;