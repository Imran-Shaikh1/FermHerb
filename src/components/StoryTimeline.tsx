import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Calendar, CheckCircle, XCircle, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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

interface StoryTimelineProps {
  events: TimelineEvent[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

const StoryTimeline = ({ events, currentStep, onStepChange }: StoryTimelineProps) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const stepIcons = {
    harvest: "🌱",
    collection: "📦", 
    processing: "⚙️",
    laboratory: "🧪",
    manufacturing: "🏭"
  };

  const stepColors = {
    harvest: "from-green-600 to-green-400",
    collection: "from-blue-600 to-blue-400", 
    processing: "from-orange-600 to-orange-400",
    laboratory: "from-purple-600 to-purple-400",
    manufacturing: "from-red-600 to-red-400"
  };

  const nextStep = () => {
    if (currentStep < events.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        onStepChange(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        onStepChange(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const currentEvent = events[currentStep];

  if (!currentEvent) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gold">Sacred Journey</h2>
          <Badge variant="secondary" className="text-gold bg-gold/10">
            Step {currentStep + 1} of {events.length}
          </Badge>
        </div>
        
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-gold to-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / events.length) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2">
          {events.map((event, index) => (
            <div key={event.id} className="flex flex-col items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-gold text-gold-foreground shadow-lg' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepIcons[event.type]}
              </div>
              <span className="text-xs text-muted-foreground mt-1 capitalize">
                {event.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Story Card */}
      <Card className={`overflow-hidden shadow-2xl border-gold/20 ${
        isAnimating ? 'story-card-exit' : 'story-card-enter'
      }`}>
        <div className={`h-2 bg-gradient-to-r ${stepColors[currentEvent.type]}`} />
        
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Content */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stepColors[currentEvent.type]} text-white shadow-lg`}>
                  <span className="text-2xl">{stepIcons[currentEvent.type]}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">{currentEvent.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {currentEvent.timestamp.toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      {currentEvent.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : currentEvent.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-destructive" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-warning animate-pulse" />
                      )}
                      <span className="capitalize">{currentEvent.status}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actor Profile */}
              <div className="bg-gold/5 rounded-xl p-6 border border-gold/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold to-primary flex items-center justify-center text-white font-bold text-lg">
                    {currentEvent.actor.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gold">Meet {currentEvent.actor.name}</h4>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {currentEvent.actor.location}
                    </div>
                  </div>
                </div>
                
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(currentEvent.metadata).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}: </span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GPS Coordinates */}
              {currentEvent.gpsCoordinates && (
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">GPS: </span>
                    <span className="font-mono">
                      {currentEvent.gpsCoordinates.lat.toFixed(4)}, 
                      {currentEvent.gpsCoordinates.lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Visual */}
            <div className="space-y-4">
              {currentEvent.photos && currentEvent.photos.length > 0 ? (
                <div className="aspect-square rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src={currentEvent.photos[0]} 
                    alt={currentEvent.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className={`aspect-square rounded-xl bg-gradient-to-br ${stepColors[currentEvent.type]} flex items-center justify-center shadow-lg`}>
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">{stepIcons[currentEvent.type]}</div>
                    <h4 className="text-xl font-bold">{currentEvent.type.charAt(0).toUpperCase() + currentEvent.type.slice(1)}</h4>
                  </div>
                </div>
              )}

              {/* Additional Photos */}
              {currentEvent.photos && currentEvent.photos.length > 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {currentEvent.photos.slice(1, 4).map((photo, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <div className="flex gap-2">
          {events.map((_, index) => (
            <button
              key={index}
              onClick={() => onStepChange(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentStep ? 'bg-gold w-8' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <Button 
          variant="outline" 
          onClick={nextStep}
          disabled={currentStep === events.length - 1}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Celebration Effect */}
      {currentStep === events.length - 1 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-gold">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="text-xl font-bold">Journey Complete!</span>
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-muted-foreground mt-2">
            This herb has completed its sacred journey from farm to your hands
          </p>
        </div>
      )}
    </div>
  );
};

export default StoryTimeline;