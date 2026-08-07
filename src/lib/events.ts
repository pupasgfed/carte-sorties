export type EventStatus = 'published' | 'draft';

export type StreetEvent = {
  id: string;
  title: string;
  description: string | null;
  date_start: string;
  date_end: string | null;
  lat: number;
  lng: number;
  city: string;
  link: string | null;
  image: string | null;
  status: EventStatus;
};

type GeoJSONFeature = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    id: string;
    title: string;
    description: string | null;
    date_start: string;
    date_end: string | null;
    city: string;
    link: string | null;
    image: string | null;
    status: EventStatus;
  };
};

type GeoJSONCollection = {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
};

export async function loadEvents(): Promise<StreetEvent[]> {
  const res = await fetch(`${import.meta.env.BASE_URL}events.geojson`);
  if (!res.ok) throw new Error(`Failed to load events: ${res.status}`);
  const geojson: GeoJSONCollection = await res.json();

  return geojson.features.map((f) => ({
    id: f.properties.id,
    title: f.properties.title,
    description: f.properties.description,
    date_start: f.properties.date_start,
    date_end: f.properties.date_end,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    city: f.properties.city,
    link: f.properties.link,
    image: f.properties.image,
    status: f.properties.status,
  }));
}

export function parseEventDate(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(value + 'T00:00:00')
    : new Date(value);
}

export type PeriodFilter = 'upcoming' | 'this-month';

export function filterByPeriod(events: StreetEvent[], period: PeriodFilter): StreetEvent[] {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  return events.filter((e) => {
    if (e.status !== 'published') return false;
    const startStr = e.date_start.slice(0, 10);
    if (startStr < todayStr) return false;

    if (period === 'upcoming') return true;

    const eventDate = parseEventDate(e.date_start);
    return (
      eventDate.getFullYear() === now.getFullYear() &&
      eventDate.getMonth() === now.getMonth()
    );
  });
}

export function formatDateRange(dateStart: string, dateEnd: string | null): string {
  const start = parseEventDate(dateStart);
  const fmt = (d: Date) =>
    d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });

  const startStr = dateStart.slice(0, 10);
  if (!dateEnd || dateEnd.slice(0, 10) === startStr) return fmt(start);
  const end = parseEventDate(dateEnd);
  return `${fmt(start)} — ${fmt(end)}`;
}
