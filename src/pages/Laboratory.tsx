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
import { TestTube, Shield, AlertTriangle, CheckCircle, XCircle, Microscope, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestBatch {
  id: string;
  batch_id: string;
  herb_name: string;
  quantity: number;
  status: 'pending' | 'testing' | 'completed' | 'failed';
  tests_completed: number;
  total_tests: number;
  results?: {
    moisture_content?: number;
    pesticide_residue?: string;
    dna_authenticity?: string;
    heavy_metals?: string;
    microbial_load?: string;
  };
}

const Laboratory = () => {
  const [testBatches, setTestBatches] = useState<TestBatch[]>([
    {
      id: '1',
      batch_id: 'ASH-2024-001',
      herb_name: 'Ashwagandha',
      quantity: 45,
      status: 'testing',
      tests_completed: 3,
      total_tests: 5,
      results: {
        moisture_content: 8.5,
        pesticide_residue: 'Below Detection Limit',
        dna_authenticity: 'Confirmed - Withania somnifera'
      }
    },
    {
      id: '2',
      batch_id: 'TUR-2024-002',
      herb_name: 'Turmeric',
      quantity: 32,
      status: 'pending',
      tests_completed: 0,
      total_tests: 5
    }
  ]);

  const [selectedBatch, setSelectedBatch] = useState<TestBatch | null>(null);
  const [testResults, setTestResults] = useState({
    moisture_content: '',
    pesticide_residue: 'Below Detection Limit',
    dna_authenticity: '',
    heavy_metals: 'Within Limits',
    microbial_load: 'Acceptable',
    certificate_number: '',
    test_result: 'pass',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const submitTestResults = async (batch: TestBatch) => {
    if (!testResults.moisture_content || !testResults.certificate_number) {
      toast({
        title: "Missing Information",
        description: "Please fill all required test fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-quality-test', {
        body: {
          batch_id: batch.batch_id,
          test_result: testResults.test_result,
          moisture_content: parseFloat(testResults.moisture_content),
          pesticide_residue: testResults.pesticide_residue,
          dna_authenticity: testResults.dna_authenticity,
          heavy_metals: testResults.heavy_metals,
          microbial_load: testResults.microbial_load,
          certificate_number: testResults.certificate_number,
          notes: testResults.notes
        }
      });

      if (response.error) throw response.error;

      // Update local state
      setTestBatches(prev => prev.map(b => 
        b.id === batch.id ? { 
          ...b, 
          status: testResults.test_result === 'pass' ? 'completed' as const : 'failed' as const,
          tests_completed: b.total_tests,
          results: {
            moisture_content: parseFloat(testResults.moisture_content),
            pesticide_residue: testResults.pesticide_residue,
            dna_authenticity: testResults.dna_authenticity,
            heavy_metals: testResults.heavy_metals,
            microbial_load: testResults.microbial_load
          }
        } : b
      ));

      // Celebration animation for passed tests
      if (testResults.test_result === 'pass') {
        // Add celebration leaves
        const leaves = document.createElement('div');
        leaves.className = 'fixed inset-0 pointer-events-none z-50';
        leaves.innerHTML = Array.from({length: 20}, (_, i) => 
          `<div class="absolute animate-celebrate-leaves text-4xl" style="left: ${Math.random() * 100}%; animation-delay: ${i * 0.1}s;">🌿</div>`
        ).join('');
        document.body.appendChild(leaves);
        setTimeout(() => document.body.removeChild(leaves), 3000);
      }

      toast({
        title: testResults.test_result === 'pass' ? "🎉 Tests Passed!" : "⚠️ Tests Failed",
        description: testResults.test_result === 'pass' 
          ? `${batch.herb_name} batch meets all quality standards` 
          : `${batch.herb_name} batch failed quality tests`,
        variant: testResults.test_result === 'pass' ? "default" : "destructive"
      });

      setSelectedBatch(null);
      setTestResults({
        moisture_content: '',
        pesticide_residue: 'Below Detection Limit',
        dna_authenticity: '',
        heavy_metals: 'Within Limits',
        microbial_load: 'Acceptable',
        certificate_number: '',
        test_result: 'pass',
        notes: ''
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit test results",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (batch: TestBatch) => {
    switch (batch.status) {
      case 'pending':
        return <Badge variant="secondary" className="flex items-center gap-1"><TestTube className="w-3 h-3" /> Awaiting Tests</Badge>;
      case 'testing':
        return <Badge variant="default" className="flex items-center gap-1 bg-warning"><Microscope className="w-3 h-3" /> Testing</Badge>;
      case 'completed':
        return <Badge variant="default" className="flex items-center gap-1 bg-success"><CheckCircle className="w-3 h-3" /> Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderTestProgress = (batch: TestBatch) => {
    const progress = (batch.tests_completed / batch.total_tests) * 100;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Test Progress</span>
          <span>{batch.tests_completed}/{batch.total_tests} tests completed</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Moisture</span>
          <span>Pesticides</span>
          <span>DNA</span>
          <span>Heavy Metals</span>
          <span>Microbial</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-4xl font-bold text-primary mb-2">
            <TestTube className="w-10 h-10 leaf-float" />
            Quality Laboratory
          </div>
          <p className="text-muted-foreground text-lg">Ensuring safety and authenticity through rigorous testing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Batches */}
          <div className="lg:col-span-2 space-y-6">
            {testBatches.map((batch) => (
              <Card key={batch.id} className="shadow-lg border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-6 h-6" />
                      {batch.herb_name} - {batch.batch_id}
                    </CardTitle>
                    {getStatusBadge(batch)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Test Progress */}
                  {renderTestProgress(batch)}

                  {/* Test Results Grid */}
                  {batch.results && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-success/10 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground mb-1">Moisture</div>
                        <div className="font-bold text-success">{batch.results.moisture_content}%</div>
                        <div className="text-xs text-success">✓ Within Limits</div>
                      </div>
                      <div className="p-3 bg-success/10 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground mb-1">Pesticides</div>
                        <div className="font-bold text-success text-xs">{batch.results.pesticide_residue}</div>
                        <div className="text-xs text-success">✓ Safe</div>
                      </div>
                      <div className="p-3 bg-success/10 rounded-lg text-center">
                        <div className="text-sm text-muted-foreground mb-1">DNA</div>
                        <div className="font-bold text-success text-xs">{batch.results.dna_authenticity?.split(' - ')[0] || 'Confirmed'}</div>
                        <div className="text-xs text-success">✓ Authentic</div>
                      </div>
                    </div>
                  )}

                  {/* Lab Visual */}
                  <div className="p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg text-center">
                    <div className="text-6xl mb-2">
                      {batch.status === 'pending' && '⏳'}
                      {batch.status === 'testing' && '🔬'}
                      {batch.status === 'completed' && '✅'}
                      {batch.status === 'failed' && '❌'}
                    </div>
                    <h3 className="text-xl font-semibold capitalize mb-1">{batch.status}</h3>
                    <p className="text-muted-foreground text-sm">
                      {batch.status === 'pending' && 'Sample received - awaiting laboratory analysis'}
                      {batch.status === 'testing' && 'Comprehensive quality tests in progress'}
                      {batch.status === 'completed' && 'All tests passed - batch approved for use'}
                      {batch.status === 'failed' && 'Quality standards not met - batch rejected'}
                    </p>
                  </div>

                  {(batch.status === 'pending' || batch.status === 'testing') && (
                    <Button 
                      onClick={() => setSelectedBatch(batch)}
                      className="w-full h-12 text-lg font-semibold"
                      variant="default"
                    >
                      {batch.status === 'pending' ? 'Begin Testing' : 'Complete Tests'}
                    </Button>
                  )}

                  {batch.status === 'completed' && (
                    <Button 
                      variant="outline"
                      className="w-full h-12 text-lg font-semibold"
                    >
                      <FileText className="w-5 h-5 mr-2" />
                      Download Certificate
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Test Form or Lab Info */}
          <div className="space-y-6">
            {selectedBatch ? (
              <Card className="shadow-lg border-2 border-primary/50">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-success/10">
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Quality Test Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-lg">{selectedBatch.herb_name}</h3>
                    <p className="text-sm text-muted-foreground">Batch: {selectedBatch.batch_id}</p>
                    <p className="text-sm text-muted-foreground">Sample: {selectedBatch.quantity} kg</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="moisture">Moisture Content (%) *</Label>
                      <Input
                        id="moisture"
                        type="number"
                        placeholder="8.5"
                        value={testResults.moisture_content}
                        onChange={(e) => setTestResults({...testResults, moisture_content: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Pesticide Residue</Label>
                      <Select value={testResults.pesticide_residue} onValueChange={(value) => setTestResults({...testResults, pesticide_residue: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Below Detection Limit">✅ Below Detection Limit</SelectItem>
                          <SelectItem value="Within Acceptable Limits">⚠️ Within Acceptable Limits</SelectItem>
                          <SelectItem value="Above Acceptable Limits">❌ Above Acceptable Limits</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dna">DNA Authenticity</Label>
                    <Input
                      id="dna"
                      placeholder="e.g., Confirmed - Withania somnifera"
                      value={testResults.dna_authenticity}
                      onChange={(e) => setTestResults({...testResults, dna_authenticity: e.target.value})}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Heavy Metals</Label>
                      <Select value={testResults.heavy_metals} onValueChange={(value) => setTestResults({...testResults, heavy_metals: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Within Limits">✅ Within Limits</SelectItem>
                          <SelectItem value="Elevated">⚠️ Elevated</SelectItem>
                          <SelectItem value="Above Limits">❌ Above Limits</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Microbial Load</Label>
                      <Select value={testResults.microbial_load} onValueChange={(value) => setTestResults({...testResults, microbial_load: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Acceptable">✅ Acceptable</SelectItem>
                          <SelectItem value="Elevated">⚠️ Elevated</SelectItem>
                          <SelectItem value="Unacceptable">❌ Unacceptable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificate">Certificate Number *</Label>
                    <Input
                      id="certificate"
                      placeholder="QC-2024-ASH-001"
                      value={testResults.certificate_number}
                      onChange={(e) => setTestResults({...testResults, certificate_number: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Overall Test Result</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={testResults.test_result === 'pass' ? "default" : "outline"}
                        onClick={() => setTestResults({...testResults, test_result: 'pass'})}
                        className={testResults.test_result === 'pass' ? "bg-success hover:bg-success/90" : ""}
                      >
                        ✅ PASS
                      </Button>
                      <Button
                        variant={testResults.test_result === 'fail' ? "destructive" : "outline"}
                        onClick={() => setTestResults({...testResults, test_result: 'fail'})}
                      >
                        ❌ FAIL
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Laboratory Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional observations, test conditions, or recommendations..."
                      value={testResults.notes}
                      onChange={(e) => setTestResults({...testResults, notes: e.target.value})}
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
                      onClick={() => submitTestResults(selectedBatch)}
                      disabled={loading}
                      className={`flex-1 ${testResults.test_result === 'pass' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'}`}
                    >
                      {loading ? "Submitting..." : "Submit Results"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Laboratory Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-success/10 rounded-lg">
                      <div className="text-2xl font-bold text-success">98.5%</div>
                      <div className="text-sm text-muted-foreground">Pass Rate</div>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">24</div>
                      <div className="text-sm text-muted-foreground">Tests Today</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Test Capabilities</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>🧪 Chemical Analysis</span>
                        <Badge variant="default" className="bg-success">NABL</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>🧬 DNA Barcoding</span>
                        <Badge variant="default" className="bg-success">Certified</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>🦠 Microbiology</span>
                        <Badge variant="default" className="bg-success">ISO 17025</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>☢️ Heavy Metals</span>
                        <Badge variant="default" className="bg-success">Accredited</Badge>
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

export default Laboratory;