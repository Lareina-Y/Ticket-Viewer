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

  function SyncBoundsToFilter({ onChange }: any) {
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

        onChange(bbox);
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
