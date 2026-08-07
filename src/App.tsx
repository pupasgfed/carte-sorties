import { useCallback, useEffect, useMemo, useState } from 'react';
import { List, Sparkles, Calendar, X, Mail, ExternalLink, MapPin } from 'lucide-react';
import StreetMap from '@/components/StreetMap';
import ListView from '@/components/ListView';
import {
  loadEvents,
  filterByPeriod,
  formatDateRange,
  type StreetEvent,
  type PeriodFilter,
} from '@/lib/events';

export default function App() {
  const [allEvents, setAllEvents] = useState<StreetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<StreetEvent | null>(null);
  const [focus, setFocus] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [showList, setShowList] = useState(false);
  const [period, setPeriod] = useState<PeriodFilter>('upcoming');

  useEffect(() => {
    loadEvents()
      .then((data) => {
        setAllEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const visibleEvents = useMemo(() => filterByPeriod(allEvents, period), [allEvents, period]);

  const handleSelect = useCallback((e: StreetEvent) => {
    setSelected(e);
    setFocus({ lat: e.lat, lng: e.lng, zoom: 13 });
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-100 text-slate-800">
      {/* Map */}
      <div className="absolute inset-0">
        <StreetMap
          events={visibleEvents}
          focus={focus}
          onSelect={handleSelect}
          selectedId={selected?.id ?? null}
        />
      </div>

      {/* Top bar */}
      <header className="absolute top-0 left-0 right-0 z-[500] flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-b from-white/90 to-transparent pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
          </div>
          <div className="leading-tight">
            <h1 className="text-sm font-semibold text-slate-900">Hypnose près de chez toi</h1>
            <p className="text-[11px] text-slate-500">Le meilleur endroit pour trouver des spectacles et sorties hypnose</p>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setShowList(true)}
            title="Voir la liste"
            className="flex items-center gap-1.5 rounded-full bg-white/80 border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:border-emerald-500/50 hover:text-emerald-600 backdrop-blur transition"
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Liste</span>
          </button>
        </div>
      </header>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[500] rounded-full bg-white/80 border border-slate-200 px-4 py-1.5 text-xs text-slate-600 backdrop-blur">
          Chargement des sorties…
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[500] rounded-full bg-red-50/90 border border-red-200 px-4 py-1.5 text-xs text-red-600 backdrop-blur">
          Erreur : {error}
        </div>
      )}

      {/* Propose outing — opens email */}
      <a
        href="mailto:redirect@redirect.com?subject=Proposition%20de%20sortie"
        className="absolute bottom-8 right-4 z-[450] flex items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-500/30 transition"
      >
        <Mail className="h-4 w-4" />
        <span className="hidden sm:inline">Proposer une sortie</span>
        <span className="sm:hidden">Proposer</span>
      </a>

      {/* Selected outing card */}
      {selected && (
        <div className="absolute bottom-4 left-1/2 sm:left-4 sm:translate-x-0 lg:left-8 z-[480] w-[calc(100%-2rem)] sm:w-80 max-w-sm -translate-x-1/2">
          <div className="rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md shadow-2xl overflow-hidden">
            {selected.image && (
              <div className="w-full">
                <img
                  src={selected.image}
                  alt={selected.title}
                  className="w-full"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">{selected.title}</h3>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {selected.description && (
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{selected.description}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDateRange(selected.date_start, selected.date_end)}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {selected.city}
                </span>
              </div>
              {selected.link && (
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 transition"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Plus d'informations
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <ListView
        open={showList}
        onClose={() => setShowList(false)}
        onSelect={handleSelect}
        events={visibleEvents}
        loading={loading}
        period={period}
        onPeriodChange={setPeriod}
      />

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-[400] hidden sm:flex items-center justify-center gap-4 pb-2 pointer-events-none">
        <a
          href="https://www.hypnosekinky.com/"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-slate-500 hover:text-emerald-400 transition pointer-events-auto"
        >
          hypnosekinky.com ↗
        </a>
        <span className="text-slate-700">·</span>
        <a
          href="https://paypal.me/pupasgfed"
          target="_blank"
          rel="noreferrer"
          className="text-[11px] text-slate-500 hover:text-emerald-600 transition pointer-events-auto"
        >
          ☕ M'offrir un café
        </a>
      </footer>
    </div>
  );
}
