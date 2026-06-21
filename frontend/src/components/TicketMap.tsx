import { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents} from 'react-leaflet';
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

export default function TicketMap({ tickets = [], onBBoxChange }: any) {
  /* TODO:
    Currently syncs map viewport (bbox) to filter state.
    Auto-search on map move is disabled because Search button controls execution.
    Debounce is kept for future support of map-driven search,
    helping avoid excessive API calls and improve UX. 
  */
  function SyncBoundsToFilter({ onChange }: any) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const round1 = (num: number) => Math.round(num * 10) / 10;
    useMapEvents({
      moveend: (e) => {
        const map = e.target;
        const b = map.getBounds();

        const bbox = [
          round1(b.getWest()),
          round1(b.getSouth()),
          round1(b.getEast()),
          round1(b.getNorth()),
        ].join(',');

        // debounce
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }

        // Execution only occurs if no new moveend occurs within 300ms.
        timerRef.current = setTimeout(() => {
          onChange(bbox);
        }, 300);
      },
    });

    return null;
  }

  return (
    <MapContainer 
      zoom={9}
      center={DEFAULT_CENTER}
      style={{ height: 500, width: '100%' }}
    >
      
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <SyncBoundsToFilter onChange={onBBoxChange} />

      {tickets
        .filter((t: any) => t.latitude !== null && t.longitude !== null)
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
