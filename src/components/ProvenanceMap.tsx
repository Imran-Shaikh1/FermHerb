import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface ProvenanceMapProps {
  events: Array<{
    event_type: string;
    coordinates?: { lat: number; lng: number };
    users: { name: string; location: string };
    metadata: any;
    created_at: string;
  }>;
}

const ProvenanceMap = ({ events }: ProvenanceMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || !events.length) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Center on India

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for events with coordinates
    const bounds: L.LatLngBounds = L.latLngBounds([]);
    
    events.forEach((event, index) => {
      if (event.coordinates) {
        const { lat, lng } = event.coordinates;
        
        // Create custom icon based on event type
        const iconColor = {
          harvest: '#22c55e',
          processing: '#f59e0b',
          quality_test: '#3b82f6',
          manufacturing: '#8b5cf6'
        }[event.event_type as keyof typeof iconColor] || '#6b7280';

        const customIcon = L.divIcon({
          html: `<div style="background-color: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          className: 'custom-div-icon',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
        
        // Add popup with event details
        marker.bindPopup(`
          <div class="text-sm">
            <h3 class="font-semibold capitalize">${event.event_type.replace('_', ' ')}</h3>
            <p><strong>Location:</strong> ${event.users.location}</p>
            <p><strong>Date:</strong> ${new Date(event.created_at).toLocaleDateString()}</p>
            <p><strong>Entity:</strong> ${event.users.name}</p>
            ${event.event_type === 'harvest' ? `<p><strong>Method:</strong> ${event.metadata.harvest_method || 'N/A'}</p>` : ''}
            ${event.event_type === 'processing' ? `<p><strong>Method:</strong> ${event.metadata.processing_method || 'N/A'}</p>` : ''}
            ${event.event_type === 'quality_test' ? `<p><strong>Result:</strong> ${event.metadata.test_result?.toUpperCase() || 'N/A'}</p>` : ''}
          </div>
        `);

        bounds.extend([lat, lng]);
      }
    });

    // Connect markers with lines to show the journey
    const coordinates = events
      .filter(e => e.coordinates)
      .map(e => [e.coordinates!.lat, e.coordinates!.lng] as [number, number]);
    
    if (coordinates.length > 1) {
      L.polyline(coordinates, {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 5'
      }).addTo(map);
    }

    // Fit map to show all markers
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [events]);

  return (
    <div className="space-y-4">
      <div ref={mapRef} className="w-full h-96 rounded-lg border" />
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Harvest</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-amber-500"></div>
          <span>Processing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span>Quality Test</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-500"></div>
          <span>Manufacturing</span>
        </div>
      </div>
    </div>
  );
};

export default ProvenanceMap;