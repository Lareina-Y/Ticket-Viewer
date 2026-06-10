import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function TicketMap({ tickets }: any) {
  const center: [number, number] = [43.7, -79.4];

  return (
    <MapContainer center={center} zoom={9} style={{ height: 500, width: '100%' }}>
      
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {tickets.map((t: any) => (
        <Marker
          key={t.id}
          position={[t.latitude, t.longitude]}
        >
          <Popup>
            <div>
              <strong>{t.ticketNo}</strong><br />
              Status: {t.status}<br />
              Station: {t.stationCode}
            </div>
          </Popup>
        </Marker>
      ))}

    </MapContainer>
  );
}