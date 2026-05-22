import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FullPageSpinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { Alert } from '../components/ui/Alert';
import { apiRequest } from '../lib/api';

interface Term {
  term: string;
  category: 'brand' | 'perfume' | 'dupe-vocab' | 'other';
  severity: number;
  is_active: boolean;
}

const CATEGORY_LABEL: Record<string, string> = {
  brand: 'Marque',
  perfume: 'Parfum',
  'dupe-vocab': 'Vocabulaire',
  other: 'Autre',
};

const CATEGORY_COLOR: Record<string, string> = {
  brand: 'bg-error-100 text-error-500',
  perfume: 'bg-warn-100 text-warn-500',
  'dupe-vocab': 'bg-cream-200 text-ink-400',
  other: 'bg-cream-200 text-ink-300',
};

export function ForbiddenPage() {
  const [items, setItems] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<{ items: Term[] }>('/api/admin/forbidden-terms')
      .then((res) => setItems(res.items))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const grouped = items.reduce<Record<string, Term[]>>((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow="Garde-fou serveur"
        title="Vocabulaire interdit"
        description="Si l'IA laisse échapper l'un de ces termes, il est silencieusement remplacé par « cette inspiration olfactive » avant d'arriver au client."
      />

      {error && <div className="mb-5"><Alert tone="error" title="Erreur">{error}</Alert></div>}

      {loading ? (
        <FullPageSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert size={36} strokeWidth={1.4} />}
          title="Liste vide"
          description="Lancez 'npm run db:seed-catalog' pour importer la liste depuis knowledgeBase.js."
        />
      ) : (
        <section className="space-y-6">
          {Object.entries(grouped).map(([cat, terms]) => (
            <div key={cat} className="bg-cream-100 ring-1 ring-ink-900/8 rounded-2xl p-5 lg:p-6 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-[20px] text-ink-900 capitalize">
                  {CATEGORY_LABEL[cat] || cat}
                </h2>
                <span className="text-[11px] text-ink-300">{terms.length} termes</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {terms.map((t) => (
                  <span
                    key={t.term}
                    className={[
                      'text-[12px] px-3 py-1 rounded-full font-mono',
                      CATEGORY_COLOR[t.category],
                      !t.is_active && 'opacity-40 line-through',
                    ].filter(Boolean).join(' ')}
                  >
                    {t.term}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </>
  );
}
