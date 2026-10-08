import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, Loader2, MapPin, Search, Star } from 'lucide-react';
import HypnotistDetail from '@/components/HypnotistDetail';
import { loadHypnotists, profileLocation, type Hypnotist } from '@/lib/hypnotists';

type Props = {
  initialId: string | null;
  onBack: () => void;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-500" aria-label={`${rating} sur 5 étoiles`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={`h-3.5 w-3.5 ${index < rating ? 'fill-current' : 'text-slate-200'}`} />
      ))}
    </span>
  );
}

export default function HypnotistsView({ initialId, onBack }: Props) {
  const [profiles, setProfiles] = useState<Hypnotist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(initialId);
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('all');
  const [rating, setRating] = useState('all');

  useEffect(() => {
    loadHypnotists()
      .then((data) => {
        setProfiles(data.filter((profile) => profile.status === 'published'));
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const departments = useMemo(
    () => Array.from(new Set(profiles.map((profile) => profile.department))).sort(),
    [profiles],
  );

  const visibleProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('fr-FR');
    return profiles
      .filter((profile) => {
        const matchesQuery = !normalizedQuery || `${profile.name} ${profile.city} ${profile.department}`.toLocaleLowerCase('fr-FR').includes(normalizedQuery);
        const matchesDepartment = department === 'all' || profile.department === department;
        const matchesRating = rating === 'all' || profile.rating >= Number(rating);
        return matchesQuery && matchesDepartment && matchesRating;
      })
      .sort((left, right) => right.rating - left.rating || left.name.localeCompare(right.name, 'fr'));
  }, [department, profiles, query, rating]);

  const activeProfile = activeId ? profiles.find((profile) => profile.id === activeId) ?? null : null;

  if (activeProfile) {
    return <HypnotistDetail profile={activeProfile} onBack={() => setActiveId(null)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Annuaire</p>
            <h1 className="text-sm font-semibold text-slate-900">Hypnose près de chez toi</h1>
          </div>
          <button onClick={onBack} className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:border-emerald-500/50 hover:text-emerald-600">
            <ArrowLeft className="h-3.5 w-3.5" /> Retour à la carte
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-10">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium text-emerald-600">Les professionnels près de chez toi</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Trouver un hypnotiste</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">Explore les profils, compare les informations et contacte directement le professionnel qui te correspond.</p>
        </div>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom, ville ou département" className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10" />
          </label>
          <select value={department} onChange={(event) => setDepartment(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-emerald-500">
            <option value="all">Tous les départements</option>
            {departments.map((value) => <option key={value} value={value}>Département {value}</option>)}
          </select>
          <select value={rating} onChange={(event) => setRating(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-emerald-500">
            <option value="all">Toutes les notes</option>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} étoiles et plus</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-slate-400"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">Impossible de charger l’annuaire.</div>
        ) : visibleProfiles.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-sm font-medium text-slate-700">Aucun profil ne correspond à ta recherche.</p>
            <p className="mt-1 text-xs text-slate-500">Essaie un autre nom, une autre ville ou une autre note.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleProfiles.map((profile) => (
              <button key={profile.id} onClick={() => setActiveId(profile.id)} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400/60 hover:shadow-lg">
                {profile.image ? <img src={profile.image} alt={profile.name} loading="lazy" className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.02]" /> : <div className="flex h-44 items-center justify-center bg-emerald-50 text-5xl font-semibold text-emerald-700">{profile.name.charAt(0).toUpperCase()}</div>}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700">{profile.name}</h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3.5 w-3.5 text-emerald-600" />{profileLocation(profile)}</p>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
                  </div>
                  <div className="mt-3 flex items-center gap-2"><Stars rating={profile.rating} /><span className="text-xs text-slate-500">{profile.rating}/5</span></div>
                  {profile.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{profile.excerpt}</p>}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
