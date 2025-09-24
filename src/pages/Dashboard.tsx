import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Leaf, Package, TestTube, Factory } from 'lucide-react';

const Dashboard = () => {
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [herbs, setHerbs] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [{ data: usersData }, { data: herbsData }] = await Promise.all([
      supabase.from('users').select('*'),
      supabase.from('herbs').select('*')
    ]);
    
    setUsers(usersData || []);
    setHerbs(herbsData || []);
  };

  const createHarvestEvent = async (formData: FormData) => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-harvest-event', {
        body: {
          batchId: formData.get('batchId'),
          herbName: formData.get('herbName'),
          farmerId: formData.get('farmerId'),
          gpsCoordinates: {
            lat: parseFloat(formData.get('latitude') as string),
            lng: parseFloat(formData.get('longitude') as string)
          },
          metadata: {
            quantity: formData.get('quantity'),
            harvest_method: formData.get('harvestMethod')
          }
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Harvest Event Created",
        description: "Successfully recorded harvest on blockchain",
      });
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

  const createProcessingEvent = async (formData: FormData) => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-processing-event', {
        body: {
          batchId: formData.get('batchId'),
          processorName: formData.get('processorName'),
          metadata: {
            processing_method: formData.get('processingMethod'),
            temperature: formData.get('temperature'),
            duration: formData.get('duration')
          }
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Processing Event Created",
        description: "Successfully recorded processing step on blockchain",
      });
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

  const createQualityTest = async (formData: FormData) => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-quality-test', {
        body: {
          batchId: formData.get('batchId'),
          labName: formData.get('labName'),
          testResults: {
            moisture: parseFloat(formData.get('moisture') as string),
            pesticide: formData.get('pesticide'),
            dna_authenticity: formData.get('dnaAuth')
          }
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Quality Test Recorded",
        description: `Test result: ${response.data.testPassed ? 'PASSED' : 'FAILED'}`,
        variant: response.data.testPassed ? "default" : "destructive"
      });
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

  const createProduct = async (formData: FormData) => {
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-product', {
        body: {
          batchId: formData.get('batchId'),
          productName: formData.get('productName'),
          manufacturerName: formData.get('manufacturerName')
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Product Created",
        description: `QR Code: ${response.data.qrCode}`,
      });
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

  const renderFarmerForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-primary" />
          Record Harvest Event
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); createHarvestEvent(new FormData(e.target as HTMLFormElement)); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batchId">Batch ID</Label>
              <Input name="batchId" placeholder="ASH-2024-001" required />
            </div>
            <div>
              <Label htmlFor="herbName">Herb</Label>
              <Select name="herbName" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select herb" />
                </SelectTrigger>
                <SelectContent>
                  {herbs.map(herb => (
                    <SelectItem key={herb.id} value={herb.name}>{herb.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="farmerId">Farmer</Label>
              <Select name="farmerId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select farmer" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === 'farmer').map(user => (
                    <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantity (kg)</Label>
              <Input name="quantity" type="number" placeholder="100" required />
            </div>
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input name="latitude" type="number" step="any" placeholder="26.9124" required />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input name="longitude" type="number" step="any" placeholder="75.7873" required />
            </div>
            <div className="col-span-2">
              <Label htmlFor="harvestMethod">Harvest Method</Label>
              <Select name="harvestMethod" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hand Picking">Hand Picking</SelectItem>
                  <SelectItem value="Machine Harvesting">Machine Harvesting</SelectItem>
                  <SelectItem value="Wild Collection">Wild Collection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Recording...' : 'Record Harvest'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderProcessorForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Record Processing Step
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); createProcessingEvent(new FormData(e.target as HTMLFormElement)); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batchId">Batch ID</Label>
              <Input name="batchId" placeholder="ASH-2024-001" required />
            </div>
            <div>
              <Label htmlFor="processorName">Processor</Label>
              <Select name="processorName" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select processor" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === 'processor').map(user => (
                    <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="processingMethod">Processing Method</Label>
              <Select name="processingMethod" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Drying">Drying</SelectItem>
                  <SelectItem value="Grinding">Grinding</SelectItem>
                  <SelectItem value="Extraction">Extraction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="temperature">Temperature</Label>
              <Input name="temperature" placeholder="40°C" required />
            </div>
            <div className="col-span-2">
              <Label htmlFor="duration">Duration</Label>
              <Input name="duration" placeholder="24 hours" required />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Recording...' : 'Record Processing'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderLabForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5 text-primary" />
          Upload Quality Test Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); createQualityTest(new FormData(e.target as HTMLFormElement)); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batchId">Batch ID</Label>
              <Input name="batchId" placeholder="ASH-2024-001" required />
            </div>
            <div>
              <Label htmlFor="labName">Laboratory</Label>
              <Select name="labName" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select lab" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === 'lab').map(user => (
                    <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="moisture">Moisture Content (%)</Label>
              <Input name="moisture" type="number" step="0.1" placeholder="10.5" required />
            </div>
            <div>
              <Label htmlFor="pesticide">Pesticide Residue</Label>
              <Select name="pesticide" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Detected">Not Detected</SelectItem>
                  <SelectItem value="Detected">Detected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="dnaAuth">DNA Authenticity</Label>
              <Select name="dnaAuth" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Uploading...' : 'Upload Test Results'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderManufacturerForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Factory className="w-5 h-5 text-primary" />
          Create Final Product
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); createProduct(new FormData(e.target as HTMLFormElement)); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="batchId">Batch ID</Label>
              <Input name="batchId" placeholder="ASH-2024-001" required />
            </div>
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input name="productName" placeholder="Ashwagandha Capsules" required />
            </div>
            <div className="col-span-2">
              <Label htmlFor="manufacturerName">Manufacturer</Label>
              <Select name="manufacturerName" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === 'manufacturer').map(user => (
                    <SelectItem key={user.id} value={user.name}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Product & Generate QR'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary mb-2">Ayurvedic Herb Traceability Dashboard</h1>
        <p className="text-muted-foreground">Blockchain-based supply chain management</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Your Role</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your role in the supply chain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="farmer">Farmer</SelectItem>
              <SelectItem value="processor">Processor</SelectItem>
              <SelectItem value="lab">Laboratory</SelectItem>
              <SelectItem value="manufacturer">Manufacturer</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedRole === 'farmer' && renderFarmerForm()}
      {selectedRole === 'processor' && renderProcessorForm()}
      {selectedRole === 'lab' && renderLabForm()}
      {selectedRole === 'manufacturer' && renderManufacturerForm()}
    </div>
  );
};

export default Dashboard;