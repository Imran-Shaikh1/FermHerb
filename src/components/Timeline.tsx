import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, Package, TestTube, Factory, MapPin, Calendar } from 'lucide-react';

interface TimelineProps {
  events: Array<{
    event_type: string;
    users: { name: string; location: string };
    metadata: any;
    created_at: string;
    is_valid: boolean;
    validation_errors?: string[];
  }>;
}

const Timeline = ({ events }: TimelineProps) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'harvest':
        return <Leaf className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Package className="w-5 h-5 text-amber-600" />;
      case 'quality_test':
        return <TestTube className="w-5 h-5 text-blue-600" />;
      case 'manufacturing':
        return <Factory className="w-5 h-5 text-purple-600" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-400" />;
    }
  };

  const getEventTitle = (eventType: string) => {
    return eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getEventDescription = (event: any) => {
    switch (event.event_type) {
      case 'harvest':
        return `Harvested using ${event.metadata.harvest_method || 'traditional methods'} by ${event.users.name}`;
      case 'processing':
        return `Processed using ${event.metadata.processing_method || 'standard method'} at ${event.metadata.temperature || 'optimal temperature'}`;
      case 'quality_test':
        return `Quality test ${event.metadata.test_result === 'pass' ? 'passed' : 'failed'} - Moisture: ${event.metadata.moisture_content}%, Pesticides: ${event.metadata.pesticide_residue}`;
      case 'manufacturing':
        return `Final product manufactured: ${event.metadata.product_name || 'Ayurvedic formulation'}`;
      default:
        return 'Supply chain event recorded';
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={index} className="flex gap-4">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border-2 border-border">
              {getEventIcon(event.event_type)}
            </div>
            {index < events.length - 1 && (
              <div className="w-0.5 h-16 bg-border mt-2" />
            )}
          </div>

          {/* Event content */}
          <div className="flex-1 pb-8">
            <Card className={!event.is_valid ? 'border-destructive' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{getEventTitle(event.event_type)}</h3>
                  <div className="flex gap-2">
                    <Badge variant={event.is_valid ? "default" : "destructive"}>
                      {event.is_valid ? 'Valid' : 'Invalid'}
                    </Badge>
                    {event.event_type === 'quality_test' && (
                      <Badge variant={event.metadata.test_result === 'pass' ? "default" : "destructive"}>
                        {event.metadata.test_result === 'pass' ? 'Passed' : 'Failed'}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-muted-foreground mb-3">
                  {getEventDescription(event)}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{event.users.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {!event.is_valid && event.validation_errors && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded-md">
                    <p className="text-sm text-destructive font-medium">Validation Errors:</p>
                    <ul className="text-sm text-destructive list-disc list-inside">
                      {event.validation_errors.map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Additional metadata based on event type */}
                {event.event_type === 'harvest' && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Quantity:</span> {event.metadata.quantity || 'N/A'} kg
                    </div>
                    <div>
                      <span className="font-medium">Method:</span> {event.metadata.harvest_method || 'N/A'}
                    </div>
                  </div>
                )}

                {event.event_type === 'processing' && (
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Method:</span> {event.metadata.processing_method || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Temperature:</span> {event.metadata.temperature || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {event.metadata.duration || 'N/A'}
                    </div>
                  </div>
                )}

                {event.event_type === 'quality_test' && (
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <span className="font-medium">Certificate:</span> {event.metadata.certificate_number || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">DNA Auth:</span> {event.metadata.dna_authenticity || 'N/A'}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;