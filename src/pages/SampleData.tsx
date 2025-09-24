import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, Play, CheckCircle } from 'lucide-react';

const SampleData = () => {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);
  const { toast } = useToast();

  const createSampleJourney = async () => {
    setLoading(true);
    setCompleted([]);

    try {
      // Step 1: Create harvest event
      const harvestResponse = await supabase.functions.invoke('create-harvest-event', {
        body: {
          batchId: 'ASH-2024-001',
          herbName: 'Ashwagandha',
          farmerId: 'Ravi Kumar',
          gpsCoordinates: { lat: 26.9124, lng: 75.7873 },
          metadata: {
            quantity: '100',
            harvest_method: 'Hand Picking'
          }
        }
      });

      if (harvestResponse.error) throw harvestResponse.error;
      setCompleted(prev => [...prev, 'harvest']);
      
      toast({
        title: "Step 1 Complete",
        description: "Harvest event created successfully",
      });

      // Wait a bit for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Create processing event
      const processingResponse = await supabase.functions.invoke('create-processing-event', {
        body: {
          batchId: 'ASH-2024-001',
          processorName: 'Ayur Processing Ltd',
          metadata: {
            processing_method: 'Drying',
            temperature: '40°C',
            duration: '24 hours'
          }
        }
      });

      if (processingResponse.error) throw processingResponse.error;
      setCompleted(prev => [...prev, 'processing']);
      
      toast({
        title: "Step 2 Complete",
        description: "Processing event created successfully",
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Create quality test - PASSING
      const qualityResponse = await supabase.functions.invoke('create-quality-test', {
        body: {
          batchId: 'ASH-2024-001',
          labName: 'Quality Labs Pvt Ltd',
          testResults: {
            moisture: 10.5,
            pesticide: 'Not Detected',
            dna_authenticity: 'Confirmed'
          }
        }
      });

      if (qualityResponse.error) throw qualityResponse.error;
      setCompleted(prev => [...prev, 'quality_test']);
      
      toast({
        title: "Step 3 Complete",
        description: "Quality test completed - PASSED",
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Create final product
      const productResponse = await supabase.functions.invoke('create-product', {
        body: {
          batchId: 'ASH-2024-001',
          productName: 'Ashwagandha Capsules',
          manufacturerName: 'Himalaya Wellness'
        }
      });

      if (productResponse.error) throw productResponse.error;
      setCompleted(prev => [...prev, 'manufacturing']);
      
      toast({
        title: "Demo Complete!",
        description: `QR Code generated: ${productResponse.data.qrCode}`,
      });

      // Now create a failed batch for demonstration
      await createFailedBatch();

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createFailedBatch = async () => {
    try {
      // Create a batch that will fail quality test
      await supabase.functions.invoke('create-harvest-event', {
        body: {
          batchId: 'ASH-2024-002-FAIL',
          herbName: 'Ashwagandha',
          farmerId: 'Ravi Kumar',
          gpsCoordinates: { lat: 26.9124, lng: 75.7873 },
          metadata: {
            quantity: '50',
            harvest_method: 'Machine Harvesting'
          }
        }
      });

      await supabase.functions.invoke('create-processing-event', {
        body: {
          batchId: 'ASH-2024-002-FAIL',
          processorName: 'Ayur Processing Ltd',
          metadata: {
            processing_method: 'Grinding',
            temperature: '45°C',
            duration: '12 hours'
          }
        }
      });

      // Quality test with FAILURE
      await supabase.functions.invoke('create-quality-test', {
        body: {
          batchId: 'ASH-2024-002-FAIL',
          labName: 'Quality Labs Pvt Ltd',
          testResults: {
            moisture: 15.5, // Too high
            pesticide: 'Detected', // Failed
            dna_authenticity: 'Confirmed'
          }
        }
      });

      toast({
        title: "Failed Batch Created",
        description: "Sample batch with quality test failure",
        variant: "destructive"
      });

    } catch (error) {
      console.error('Error creating failed batch:', error);
    }
  };

  const steps = [
    {
      id: 'harvest',
      title: 'Harvest Event',
      description: 'Farmer records herb collection with GPS coordinates',
      icon: '🌱'
    },
    {
      id: 'processing',
      title: 'Processing Step',
      description: 'Processor logs drying and preparation details',
      icon: '⚙️'
    },
    {
      id: 'quality_test',
      title: 'Quality Test',
      description: 'Lab uploads test results for moisture, pesticides, DNA',
      icon: '🧪'
    },
    {
      id: 'manufacturing',
      title: 'Manufacturing',
      description: 'Final product created with QR code generation',
      icon: '🏭'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Demo Data Creation</h1>
        <p className="text-muted-foreground">Generate sample blockchain data for Ashwagandha traceability</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Sample Journey Creation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            This will create a complete sample journey for an Ashwagandha batch from farm to final product,
            including both a successful batch and a failed quality test batch for demonstration.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <Card key={step.id} className={`transition-all ${completed.includes(step.id) ? 'bg-green-50 border-green-200' : ''}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <h3 className="font-semibold mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                  {completed.includes(step.id) && (
                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Button 
            onClick={createSampleJourney} 
            disabled={loading} 
            className="w-full"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            {loading ? 'Creating Sample Data...' : 'Create Demo Journey'}
          </Button>

          {completed.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Demo QR Codes Created:</h4>
              <div className="space-y-1 text-sm">
                <p className="font-mono">QR-ASH-2024-001-demo (Successful batch)</p>
                <p className="font-mono text-red-600">QR-ASH-2024-002-FAIL-demo (Failed quality test)</p>
              </div>
              <p className="text-xs text-green-700 mt-2">
                Use these QR codes in the Consumer Portal to see the full traceability data.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What Gets Created</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium">✅ Successful Batch:</span>
              <span>Complete journey from harvest to final product with passing quality tests</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">❌ Failed Batch:</span>
              <span>Batch that fails quality testing (high moisture + pesticide detection)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">🗺️ GPS Data:</span>
              <span>Sample coordinates from Rajasthan (traditional Ashwagandha growing region)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium">📋 Smart Contracts:</span>
              <span>Validation rules for seasonal harvesting, geo-fencing, and quality gates</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SampleData;