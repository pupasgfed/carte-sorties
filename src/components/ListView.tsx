import { List, MapPin, Calendar, X, Loader2, ExternalLink, Filter } from 'lucide-react';
import type { StreetEvent, PeriodFilter } from '@/lib/events';
import { formatDateRange } from '@/lib/events';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (e: StreetEvent) => void;
  events: StreetEvent[];
  loading: boolean;
  period: PeriodFilter;
  onPeriodChange: (p: PeriodFilter) => void;
};

export default function ListView({
  open,
  onClose,
  onSelect,
  events,
  loading,
  period,
  onPeriodChange,
}: Props) {
  return (
    <>
      <div
        className={`fixed inset-0 z-[900] bg-slate-900/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed right-0 top-0 z-[950] h-full w-full max-w-md bg-white border-l border-slate-200 shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <List className="h-4 w-4 text-emerald-600" />
            Liste des sorties
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <div className="flex gap-1.5">
            {(
              [
                { value: 'upcoming', label: 'À venir' },
                { value: 'this-month', label: 'Ce mois' },
              ] as { value: PeriodFilter; label: string }[]
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={() => onPeriodChange(opt.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  period === opt.value
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 border border-slate-200 text-slate-600 hover:border-emerald-500/40 hover:text-emerald-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100%-7.5rem)] p-4 space-y-3 scrollbar-thin">
          {loading ? (
            <div className="flex justify-center py-10 text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-10">
              Aucune sortie pour cette période.
            </p>
          ) : (
            events.map((e) => (
              <button
                key={e.id}
                onClick={() => {
                  onSelect(e);
                  onClose();
                }}
                className="block w-full text-left rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden hover:border-emerald-500/40 hover:bg-emerald-50/50 transition group"
              >
                {e.image && (
                  <div className="relative h-32 w-full overflow-hidden">
                    <img
                      src={e.image}
                      alt={e.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm font-medium text-slate-900 group-hover:text-emerald-700 transition">
                        {e.title}
                      </span>
                    </div>
                    <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500">
                      {e.city}
                    </span>
                  </div>
                  {e.description && (
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">{e.description}</p>
                  )}
                  <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateRange(e.date_start, e.date_end)}
                    </span>
                    {e.link && (
                      <span className="flex items-center gap-1 text-emerald-600/70">
                        <ExternalLink className="h-3 w-3" />
                        Lien
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
