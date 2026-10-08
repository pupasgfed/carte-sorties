import { useMemo } from 'react';
import { ArrowLeft, Globe, Instagram, Mail, MapPin, Phone, Star, Twitter } from 'lucide-react';
import { profileLocation, renderHypnotistMarkdown, type Hypnotist } from '@/lib/hypnotists';

type Props = {
  profile: Hypnotist;
  onBack: () => void;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-500" aria-label={`${rating} sur 5 étoiles`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} className={`h-4 w-4 ${index < rating ? 'fill-current' : 'text-slate-200'}`} />
      ))}
    </span>
  );
}

export default function HypnotistDetail({ profile, onBack }: Props) {
  const html = useMemo(
    () => (profile.description ? renderHypnotistMarkdown(profile.description) : ''),
    [profile.description],
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">Annuaire</p>
            <h1 className="text-sm font-semibold text-slate-900">Hypnose près de chez toi</h1>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:border-emerald-500/50 hover:text-emerald-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à l’annuaire
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-0 md:grid-cols-[minmax(240px,0.8fr)_1.2fr]">
            {profile.image ? (
              <img src={profile.image} alt={profile.name} className="h-72 w-full object-cover md:h-full md:min-h-[360px]" />
            ) : (
              <div className="flex min-h-[240px] items-center justify-center bg-emerald-50 text-6xl font-semibold text-emerald-700">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <Stars rating={profile.rating} />
                <span className="text-xs text-slate-500">{profile.rating}/5</span>
              </div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{profile.name}</h2>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                <MapPin className="h-4 w-4 text-emerald-600" />
                {profileLocation(profile)}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {profile.website && <a className="profile-link" href={profile.website} target="_blank" rel="noreferrer"><Globe className="h-4 w-4" /> Site web</a>}
                {profile.phone && <a className="profile-link" href={`tel:${profile.phone}`}><Phone className="h-4 w-4" /> Téléphone</a>}
                {profile.email && <a className="profile-link" href={`mailto:${profile.email}`}><Mail className="h-4 w-4" /> Email</a>}
                {profile.instagram && <a className="profile-link" href={`https://instagram.com/${profile.instagram.replace(/^@/, '')}`} target="_blank" rel="noreferrer"><Instagram className="h-4 w-4" /> Instagram</a>}
                {profile.twitter && <a className="profile-link" href={`https://twitter.com/${profile.twitter.replace(/^@/, '')}`} target="_blank" rel="noreferrer"><Twitter className="h-4 w-4" /> Twitter</a>}
              </div>
            </div>
          </div>
        </section>

        {html && <article className="article-content mx-auto mt-8 max-w-3xl" dangerouslySetInnerHTML={{ __html: html }} />}
      </main>
    </div>
  );
}
