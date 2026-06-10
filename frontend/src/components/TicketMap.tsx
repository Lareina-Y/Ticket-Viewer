import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Default map center if no valid points
const DEFAULT_CENTER: [number, number] = [43.7, -79.4];
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function TicketMap({ tickets = [] }: any) {

  return (
    <MapContainer zoom={9} style={{ height: 500, width: '100%' }}>
      
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds tickets={tickets} />

      {tickets
        .filter((t: any) => t.latitude && t.longitude)
        .map((t: any) => (
        <Marker
          key={t.id}
          position={[Number(t.latitude), Number(t.longitude)]}
        >
          <Popup>
            <div>
              <strong>{t.ticketNo}</strong><br />
              Status: {t.status}<br />
              Station: {t.stationCode}<br />
              Utility Type: {t.utilityType}
            </div>
          </Popup>
        </Marker>
      ))}

    </MapContainer>
  );
}

// Utility component to fit map bounds to ticket locations
export function FitBounds({ tickets = [] }: any): null {
  const map = useMap();

  useEffect(() => {
    const validPoints = tickets
      .filter((t: any) => t.latitude && t.longitude)
      .map((t: any) => [Number(t.latitude), Number(t.longitude)] as [number, number]);

    if (validPoints.length === 0) {
      map.setView(DEFAULT_CENTER, 9);
      return;
    }

    const bounds = L.latLngBounds(validPoints);

    map.fitBounds(bounds, {
      padding: [50, 50], // White space at the edges
      maxZoom: 13,       // Prevent excessive zooming
    });
  }, [tickets, map]);

  return null;
}