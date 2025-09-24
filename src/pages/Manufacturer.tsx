import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, QrCode, Award, Sparkles, Calendar, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

interface QualifiedBatch {
  id: string;
  batch_id: string;
  herb_name: string;
  quantity: number;
  test_passed: boolean;
  certificate_number: string;
  quality_score: number;
}

const Manufacturer = () => {
  const [qualifiedBatches, setQualifiedBatches] = useState<QualifiedBatch[]>([
    {
      id: '1',
      batch_id: 'ASH-2024-001',
      herb_name: 'Ashwagandha',
      quantity: 45,
      test_passed: true,
      certificate_number: 'QC-2024-ASH-001',
      quality_score: 98
    },
    {
      id: '2',
      batch_id: 'TUR-2024-002',
      herb_name: 'Turmeric',
      quantity: 32,
      test_passed: true,
      certificate_number: 'QC-2024-TUR-002',
      quality_score: 95
    }
  ]);

  const [selectedBatch, setSelectedBatch] = useState<QualifiedBatch | null>(null);
  const [productData, setProductData] = useState({
    productName: '',
    formulation: 'powder',
    packagingSize: '100',
    packagingType: 'bottle',
    expiryMonths: '24',
    batchSize: '',
    description: '',
    sustainabilityCerts: [] as string[]
  });
  
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sustainabilityCertifications = [
    'organic', 'fair-trade', 'eco-friendly', 'carbon-neutral', 'biodegradable-packaging'
  ];

  const generateProduct = async (batch: QualifiedBatch) => {
    if (!productData.productName || !productData.batchSize) {
      toast({
        title: "Missing Information",
        description: "Please fill product name and batch size",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-product', {
        body: {
          batch_id: batch.batch_id,
          product_name: productData.productName,
          formulation: productData.formulation,
          packaging_size: parseInt(productData.packagingSize),
          packaging_type: productData.packagingType,
          expiry_months: parseInt(productData.expiryMonths),
          batch_size: parseInt(productData.batchSize),
          description: productData.description,
          sustainability_certs: productData.sustainabilityCerts
        }
      });

      if (response.error) throw response.error;

      const qrCodeText = response.data.qr_code;
      setGeneratedQR(qrCodeText);

      // Celebration animation
      const sparkles = document.createElement('div');
      sparkles.className = 'fixed inset-0 pointer-events-none z-50';
      sparkles.innerHTML = Array.from({length: 30}, (_, i) => 
        `<div class="absolute animate-celebrate-leaves text-3xl" style="left: ${Math.random() * 100}%; animation-delay: ${i * 0.05}s;">✨</div>`
      ).join('');
      document.body.appendChild(sparkles);
      setTimeout(() => document.body.removeChild(sparkles), 4000);

      toast({
        title: "🎉 Product Created Successfully!",
        description: `${productData.productName} is ready for market with QR code`,
      });

      // Reset form
      setProductData({
        productName: '',
        formulation: 'powder',
        packagingSize: '100',
        packagingType: 'bottle',
        expiryMonths: '24',
        batchSize: '',
        description: '',
        sustainabilityCerts: []
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSustainabilityCert = (cert: string) => {
    setProductData(prev => ({
      ...prev,
      sustainabilityCerts: prev.sustainabilityCerts.includes(cert)
        ? prev.sustainabilityCerts.filter(c => c !== cert)
        : [...prev.sustainabilityCerts, cert]
    }));
  };

  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');

  const generateQRCode = async (qrText: string) => {
    try {
      const svg = await QRCode.toString(qrText, {
        type: 'svg',
        width: 200,
        margin: 2,
        color: {
          dark: '#0F5132',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      setQrCodeSvg(svg);
    } catch (error) {
      console.error('QR Code generation error:', error);
      toast({
        title: "QR Code Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive"
      });
      setQrCodeSvg('<div class="text-center text-destructive p-4">QR Code Error</div>');
    }
  };

  useEffect(() => {
    if (generatedQR) {
      generateQRCode(generatedQR);
    }
  }, [generatedQR]);

  const getCertBadgeColor = (cert: string) => {
    const colors = {
      'organic': 'bg-success',
      'fair-trade': 'bg-warning',
      'eco-friendly': 'bg-primary',
      'carbon-neutral': 'bg-accent',
      'biodegradable-packaging': 'bg-secondary'
    };
    return colors[cert as keyof typeof colors] || 'bg-muted';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-4xl font-bold text-primary mb-2">
            <Package className="w-10 h-10 leaf-float" />
            Manufacturing Hub
          </div>
          <p className="text-muted-foreground text-lg">Create premium Ayurvedic products with complete traceability</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Qualified Batches */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6" />
                  Quality-Approved Batches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {qualifiedBatches.map((batch) => (
                  <Card key={batch.id} className="border-2 border-success/30 hover:border-success/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                            {batch.herb_name}
                            <Badge variant="default" className="bg-success">✓ Certified</Badge>
                          </h3>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Batch ID: {batch.batch_id}</div>
                            <div>Certificate: {batch.certificate_number}</div>
                            <div>Quantity: {batch.quantity} kg</div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-success">{batch.quality_score}</div>
                          <div className="text-xs text-muted-foreground">Quality Score</div>
                        </div>
                      </div>

                      {/* Premium Quality Indicators */}
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="text-center p-3 bg-success/10 rounded-lg">
                          <div className="text-2xl mb-1">🌿</div>
                          <div className="text-xs font-medium">Premium Grade</div>
                        </div>
                        <div className="text-center p-3 bg-success/10 rounded-lg">
                          <div className="text-2xl mb-1">🧪</div>
                          <div className="text-xs font-medium">Lab Verified</div>
                        </div>
                        <div className="text-center p-3 bg-success/10 rounded-lg">
                          <div className="text-2xl mb-1">🛡️</div>
                          <div className="text-xs font-medium">Pesticide Free</div>
                        </div>
                        <div className="text-center p-3 bg-success/10 rounded-lg">
                          <div className="text-2xl mb-1">🧬</div>
                          <div className="text-xs font-medium">DNA Authentic</div>
                        </div>
                      </div>

                      <Button 
                        onClick={() => setSelectedBatch(batch)}
                        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-gold to-warning hover:from-gold/90 hover:to-warning/90"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Create Premium Product
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            {/* Generated Product Preview */}
            {generatedQR && (
              <Card className="shadow-lg border-2 border-gold/50 bg-gradient-to-br from-gold/5 to-warning/5">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <Sparkles className="w-8 h-8 text-gold" />
                    Premium Product Created!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-xl shadow-lg">
                      <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} />
                    </div>
                    <p className="mt-3 font-semibold text-lg">QR Code: {generatedQR}</p>
                    <p className="text-muted-foreground">Scan to view complete product journey</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 p-4 bg-white/50 rounded-lg">
                    <div className="text-center">
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <div className="font-semibold">Manufacturer</div>
                      <div className="text-sm text-muted-foreground">Himalaya Wellness</div>
                    </div>
                    <div className="text-center">
                      <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <div className="font-semibold">Manufacturing Date</div>
                      <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</div>
                    </div>
                  </div>

                  <Button className="w-full h-12 bg-primary hover:bg-primary/90">
                    <QrCode className="w-5 h-5 mr-2" />
                    Print Labels & QR Codes
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Product Creation Form */}
          <div className="space-y-6">
            {selectedBatch ? (
              <Card className="shadow-lg border-2 border-gold/50">
                <CardHeader className="bg-gradient-to-r from-gold/10 to-warning/10">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Create Premium Product
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg">{selectedBatch.herb_name}</h3>
                    <p className="text-sm text-muted-foreground">Batch: {selectedBatch.batch_id}</p>
                    <Badge variant="default" className="bg-success mt-1">Quality Score: {selectedBatch.quality_score}/100</Badge>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name *</Label>
                    <Input
                      id="productName"
                      placeholder="e.g., Premium Ashwagandha Powder"
                      value={productData.productName}
                      onChange={(e) => setProductData({...productData, productName: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Formulation</Label>
                      <Select value={productData.formulation} onValueChange={(value) => setProductData({...productData, formulation: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="powder">🌾 Powder</SelectItem>
                          <SelectItem value="capsules">💊 Capsules</SelectItem>
                          <SelectItem value="tablets">⚪ Tablets</SelectItem>
                          <SelectItem value="extract">🧪 Extract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="batchSize">Batch Size (units) *</Label>
                      <Input
                        id="batchSize"
                        type="number"
                        placeholder="1000"
                        value={productData.batchSize}
                        onChange={(e) => setProductData({...productData, batchSize: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Package Size</Label>
                      <Select value={productData.packagingSize} onValueChange={(value) => setProductData({...productData, packagingSize: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="50">50g</SelectItem>
                          <SelectItem value="100">100g</SelectItem>
                          <SelectItem value="250">250g</SelectItem>
                          <SelectItem value="500">500g</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Packaging Type</Label>
                      <Select value={productData.packagingType} onValueChange={(value) => setProductData({...productData, packagingType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bottle">🍶 Glass Bottle</SelectItem>
                          <SelectItem value="pouch">📦 Eco Pouch</SelectItem>
                          <SelectItem value="jar">🏺 Premium Jar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Sustainability Certifications</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {sustainabilityCertifications.map(cert => (
                        <Button
                          key={cert}
                          variant={productData.sustainabilityCerts.includes(cert) ? "default" : "outline"}
                          onClick={() => toggleSustainabilityCert(cert)}
                          className={`justify-start text-xs ${productData.sustainabilityCerts.includes(cert) ? getCertBadgeColor(cert) : ''}`}
                        >
                          {cert === 'organic' && '🌱 Organic'}
                          {cert === 'fair-trade' && '🤝 Fair Trade'}
                          {cert === 'eco-friendly' && '♻️ Eco-Friendly'}
                          {cert === 'carbon-neutral' && '🌍 Carbon Neutral'}
                          {cert === 'biodegradable-packaging' && '🌿 Bio-Packaging'}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Product Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Premium quality Ayurvedic formulation with complete traceability..."
                      value={productData.description}
                      onChange={(e) => setProductData({...productData, description: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => setSelectedBatch(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => generateProduct(selectedBatch)}
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-gold to-warning hover:from-gold/90 hover:to-warning/90"
                    >
                      {loading ? "Creating..." : "Create Product"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Manufacturing Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-gold/10 rounded-lg">
                      <div className="text-2xl font-bold text-gold">156</div>
                      <div className="text-sm text-muted-foreground">Products Created</div>
                    </div>
                    <div className="p-4 bg-success/10 rounded-lg">
                      <div className="text-2xl font-bold text-success">99.2%</div>
                      <div className="text-sm text-muted-foreground">Quality Rate</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Production Lines</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>🌾 Powder Line</span>
                        <Badge variant="default" className="bg-success">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>💊 Capsule Line</span>
                        <Badge variant="default" className="bg-success">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>⚪ Tablet Line</span>
                        <Badge variant="secondary">Standby</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Recent Products</h4>
                    <div className="space-y-2 text-sm">
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">Premium Ashwagandha</div>
                        <div className="text-muted-foreground">QR-ASH-2024-001 • 1000 units</div>
                      </div>
                      <div className="p-2 bg-muted/50 rounded">
                        <div className="font-medium">Golden Turmeric Powder</div>
                        <div className="text-muted-foreground">QR-TUR-2024-002 • 800 units</div>
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

export default Manufacturer;