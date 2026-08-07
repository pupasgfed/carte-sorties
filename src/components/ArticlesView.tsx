import { useEffect, useState } from 'react';
import { ArrowLeft, Sparkles, Calendar, User, Loader2, BookOpen } from 'lucide-react';
import { loadArticles, formatDate, type Article } from '@/lib/articles';
import ArticleDetail from '@/components/ArticleDetail';

type Props = {
  onBack: () => void;
  initialSlug?: string | null;
};

export default function ArticlesView({ onBack, initialSlug }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(initialSlug ?? null);

  useEffect(() => {
    loadArticles()
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const active = activeSlug ? articles.find((a) => a.slug === activeSlug) ?? null : null;

  if (active) {
    return (
      <ArticleDetail
        article={active}
        onBack={() => setActiveSlug(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-slate-900">Hypnose près de chez toi</h1>
              <p className="text-[11px] text-slate-500">Articles</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-emerald-500/50 hover:text-emerald-600 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Retour à la Liste</span>
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">Articles</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-20 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            Erreur : {error}
          </div>
        ) : articles.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-20">
            Aucun article pour le moment.
          </p>
        ) : (
          <div className="space-y-4">
            {articles.map((a) => (
              <button
                key={a.slug}
                onClick={() => setActiveSlug(a.slug)}
                className="block w-full text-left rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-emerald-500/40 hover:shadow-lg transition group"
              >
                {a.cover && (
                  <div className="h-40 w-full overflow-hidden">
                    <img
                      src={a.cover}
                      alt={a.title}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition">
                    {a.title}
                  </h3>
                  {a.excerpt && (
                    <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">
                      {a.excerpt}
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    {a.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(a.date)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {a.author}
                    </span>
                    {a.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {a.categories.map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-emerald-700"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-center gap-4 px-4 py-4">
          <a
            href="https://www.hypnosekinky.com/"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-slate-500 hover:text-emerald-600 transition"
          >
            hypnosekinky.com ↗
          </a>
          <span className="text-slate-700">·</span>
          <a
            href="https://paypal.me/pupasgfed"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-slate-500 hover:text-emerald-600 transition"
          >
            ☕ M'offrir un café
          </a>
        </div>
      </footer>
    </div>
  );
}
