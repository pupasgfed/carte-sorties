import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import type { StreetEvent } from '@/lib/events';

function makeIcon(count: number) {
  const badge = count > 1 ? `<span class="streetmap-badge">${count}</span>` : '';
  return L.divIcon({
    className: 'streetmap-marker',
    html: `<div class="streetmap-pin">${badge}</div>`,
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
  });
}

function FlyTo({ lat, lng, zoom }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom ?? map.getZoom(), { duration: 0.8 });
  }, [lat, lng, zoom, map]);
  return null;
}

type Props = {
  events: StreetEvent[];
  focus: { lat: number; lng: number; zoom?: number } | null;
  onSelect: (e: StreetEvent) => void;
  selectedId: string | null;
};

export default function StreetMap({ events, focus, onSelect, selectedId }: Props) {
  const iconCache = useMemo(() => {
    const m = new Map<number, L.DivIcon>();
    return (count: number) => {
      if (!m.has(count)) m.set(count, makeIcon(count));
      return m.get(count)!;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, StreetEvent[]>();
    for (const e of events) {
      const key = `${e.lat.toFixed(3)}|${e.lng.toFixed(3)}`;
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }
    return Array.from(map.values());
  }, [events]);

  const markerRefs = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!selectedId) return;
    const m = markerRefs.current[selectedId];
    if (m) m.openPopup();
  }, [selectedId]);

  return (
    <MapContainer
      center={[46.2276, 2.2137]}
      zoom={6}
      minZoom={5}
      maxZoom={18}
      zoomControl={false}
      className="h-full w-full"
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      {focus && <FlyTo lat={focus.lat} lng={focus.lng} zoom={focus.zoom} />}

      {grouped.map((group) => {
        const [first] = group;
        const key = `${first.lat.toFixed(3)}|${first.lng.toFixed(3)}`;
        return (
          <Marker
            key={key}
            position={[first.lat, first.lng]}
            icon={iconCache(group.length)}
            ref={(ref) => {
              if (ref) markerRefs.current[first.id] = ref;
            }}
          >
            <Popup>
              <div className="space-y-1.5">
                {group.length > 1 && (
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                    Plusieurs sorties ici
                  </p>
                )}
                {group.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onSelect(e)}
                    className="block text-left text-sm font-medium text-slate-900 hover:text-emerald-700 transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                      {e.title}
                    </span>
                    {e.date_start && (
                      <span className="ml-5 text-xs text-slate-500">
                        {new Date(e.date_start + 'T00:00:00').toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
