import { useEffect, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FullPageSpinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { Alert } from '../components/ui/Alert';
import { apiRequest } from '../lib/api';

interface Mapping {
  id: string;
  triggers: string[];
  product_id: string;
  notes_to_pitch: string | null;
  is_active: boolean;
  hit_count: number;
  products?: { slug: string; name: string };
}

export function MappingsPage() {
  const [items, setItems] = useState<Mapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<{ items: Mapping[] }>('/api/admin/dupe-mappings')
      .then((res) => setItems(res.items))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Cœur de la stratégie"
        title="Mappages cachés"
        description="Quand un visiteur cite une fragrance célèbre, l'IA détecte silencieusement le mot-clé et propose le produit Eleganza correspondant — sans jamais nommer l'original."
      />

      {error && <div className="mb-5"><Alert tone="error" title="Erreur">{error}</Alert></div>}

      {loading ? (
        <FullPageSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Shuffle size={36} strokeWidth={1.4} />}
          title="Aucun mappage"
          description="Lancez 'npm run db:seed-catalog' pour importer les 22 mappages depuis knowledgeBase.js."
        />
      ) : (
        <div className="bg-cream-100 ring-1 ring-ink-900/8 rounded-2xl overflow-hidden shadow-card">
          <table className="w-full text-[13.5px]">
            <thead className="bg-cream-200/50">
              <tr className="text-left text-[10.5px] uppercase tracking-elegant text-ink-300">
                <th className="px-5 py-3 font-medium">Mots-clés détectés</th>
                <th className="px-5 py-3 font-medium">→ Produit Eleganza</th>
                <th className="px-5 py-3 font-medium text-right">Déclenchements</th>
                <th className="px-5 py-3 font-medium text-center">Actif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/8">
              {items.map((m) => (
                <tr key={m.id} className="hover:bg-cream-200/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {m.triggers.map((t) => (
                        <span key={t} className="text-[11px] bg-cream-50 ring-1 ring-ink-900/8 text-ink-400 px-2 py-0.5 rounded-full font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="font-sans tracking-elegant uppercase text-ink-900 font-semibold">
                      {m.products?.name || m.product_id}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-ink-400 font-mono">{m.hit_count}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={[
                      'inline-block w-2 h-2 rounded-full',
                      m.is_active ? 'bg-success-500' : 'bg-ink-100',
                    ].join(' ')} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
