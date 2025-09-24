import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Camera, Leaf, Calendar, User, History } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Farmer = () => {
  const [formData, setFormData] = useState({
    herbType: '',
    quantity: '',
    harvestMethod: 'hand-picked',
    notes: '',
    photo: null as File | null
  });
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentHarvests, setRecentHarvests] = useState([]);
  const { toast } = useToast();

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        toast({
          title: "Location Captured",
          description: "GPS coordinates recorded successfully",
        });
      },
      (error) => {
        toast({
          title: "Location Error",
          description: "Unable to get your location. Please enable GPS.",
          variant: "destructive"
        });
      }
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, photo: e.target.files[0] });
    }
  };

  const submitHarvest = async () => {
    if (!formData.herbType || !formData.quantity || !location) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields and capture location",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-harvest-event', {
        body: {
          herb_name: formData.herbType,
          quantity: parseFloat(formData.quantity),
          harvest_method: formData.harvestMethod,
          gps_coordinates: `(${location.lat},${location.lng})`,
          notes: formData.notes
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "🌿 Harvest Recorded!",
        description: "Your harvest has been added to the blockchain",
      });

      // Reset form
      setFormData({
        herbType: '',
        quantity: '',
        harvestMethod: 'hand-picked',
        notes: '',
        photo: null
      });
      setLocation(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to record harvest",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-4xl font-bold text-primary mb-2">
            <Leaf className="w-10 h-10 leaf-float" />
            Farmer Portal
          </div>
          <p className="text-muted-foreground text-lg">Record your herb harvest with transparency and pride</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Harvest Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-2 border-success/20">
              <CardHeader className="bg-gradient-to-r from-success/10 to-primary/10">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Leaf className="w-6 h-6" />
                  Record New Harvest
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Herb Selection */}
                <div className="space-y-2">
                  <Label htmlFor="herbType" className="text-base font-semibold">Herb Type *</Label>
                  <Select value={formData.herbType} onValueChange={(value) => setFormData({...formData, herbType: value})}>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Choose the herb you harvested" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ashwagandha">🌿 Ashwagandha (Withania somnifera)</SelectItem>
                      <SelectItem value="turmeric">🟡 Turmeric (Curcuma longa)</SelectItem>
                      <SelectItem value="brahmi">💚 Brahmi (Bacopa monnieri)</SelectItem>
                      <SelectItem value="neem">🌳 Neem (Azadirachta indica)</SelectItem>
                      <SelectItem value="tulsi">🍃 Tulsi (Ocimum sanctum)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-base font-semibold">Quantity (kg) *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="e.g., 25.5"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      className="h-12 text-base"
                    />
                  </div>

                  {/* Harvest Method */}
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Harvest Method</Label>
                    <Select value={formData.harvestMethod} onValueChange={(value) => setFormData({...formData, harvestMethod: value})}>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hand-picked">👐 Hand-picked (Traditional)</SelectItem>
                        <SelectItem value="organic-tools">🛠️ Organic Tools</SelectItem>
                        <SelectItem value="sustainable">♻️ Sustainable Methods</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location Capture */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Harvest Location *</Label>
                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={getLocation}
                      variant={location ? "default" : "outline"}
                      className="flex items-center gap-2 h-12"
                    >
                      <MapPin className="w-5 h-5" />
                      {location ? "Location Captured ✓" : "Capture GPS Location"}
                    </Button>
                    {location && (
                      <Badge variant="default" className="px-3 py-1">
                        📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Harvest Photo</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-base font-medium">
                        {formData.photo ? formData.photo.name : "Click to upload harvest photo"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Show the quality of your harvest
                      </p>
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-base font-semibold">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special conditions, organic certifications, or quality observations..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="min-h-24 text-base"
                  />
                </div>

                {/* Submit Button */}
                <Button 
                  onClick={submitHarvest}
                  disabled={loading}
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-success to-primary hover:from-success/90 hover:to-primary/90"
                >
                  {loading ? "Recording Harvest..." : "🌿 Record Harvest to Blockchain"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Farmer Profile & Recent Activity */}
          <div className="space-y-6">
            {/* Farmer Profile Card */}
            <Card className="shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-success to-primary rounded-full mx-auto flex items-center justify-center mb-3">
                  <User className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-xl">Ravi Kumar</CardTitle>
                <p className="text-muted-foreground">Organic Farmer</p>
                <Badge variant="secondary" className="mx-auto">📍 Rajasthan, India</Badge>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <div className="font-bold text-lg text-success">127</div>
                    <div className="text-muted-foreground">Total Harvests</div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="font-bold text-lg text-primary">98%</div>
                    <div className="text-muted-foreground">Quality Rate</div>
                  </div>
                </div>
                <Separator />
                <div className="text-left space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Specialization:</span>
                    <span className="font-medium">Ashwagandha, Turmeric</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Farm Size:</span>
                    <span className="font-medium">15 acres</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Certification:</span>
                    <Badge variant="default" className="text-xs">🌱 Organic</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Harvests */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Harvests
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {[
                  { herb: "Ashwagandha", qty: "45 kg", date: "2 days ago", status: "verified" },
                  { herb: "Turmeric", qty: "30 kg", date: "1 week ago", status: "processing" },
                  { herb: "Brahmi", qty: "12 kg", date: "2 weeks ago", status: "completed" }
                ].map((harvest, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">{harvest.herb}</div>
                      <div className="text-sm text-muted-foreground">{harvest.qty} • {harvest.date}</div>
                    </div>
                    <Badge 
                      variant={harvest.status === 'verified' ? 'default' : harvest.status === 'processing' ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {harvest.status === 'verified' ? '✓' : harvest.status === 'processing' ? '⏳' : '✅'} {harvest.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Farmer;