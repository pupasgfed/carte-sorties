import { useMemo } from 'react';
import { ArrowLeft, Calendar, User, Sparkles } from 'lucide-react';
import { renderMarkdown, formatDate, type Article } from '@/lib/articles';

type Props = {
  article: Article;
  onBack: () => void;
};

export default function ArticleDetail({ article, onBack }: Props) {
  const html = useMemo(() => renderMarkdown(article.body), [article.body]);

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

      {/* Article body */}
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8">
        {article.cover && (
          <div className="mb-6 overflow-hidden rounded-2xl">
            <img
              src={article.cover}
              alt={article.title}
              className="w-full object-cover"
            />
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          {article.date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(article.date)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {article.author}
          </span>
          {article.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {article.categories.map((c) => (
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

        <h2 className="mb-6 text-2xl font-bold text-slate-900">{article.title}</h2>

        <article
          className="article-content"
          dangerouslySetInnerHTML={{ __html: html }}
        />
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
