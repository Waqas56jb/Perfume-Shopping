import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Plus, Pencil, Trash2, X, Search, Download } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FullPageSpinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { apiRequest, ApiError } from '../lib/api';

interface Mapping {
  id: string;
  triggers: string[];
  product_id: string;
  notes_to_pitch: string | null;
  is_active: boolean;
  hit_count: number;
  products?: { slug: string; name: string };
}

interface CatalogItem {
  slug: string;
  name: string;
  gender: 'F' | 'H' | 'U';
  in_stock: boolean;
}

interface DrawerForm {
  id: string | null;     // null = create, string = edit
  triggersText: string;  // comma-or-newline separated
  productSlug: string;
  isActive: boolean;
}

const EMPTY_FORM: DrawerForm = { id: null, triggersText: '', productSlug: '', isActive: true };

export function MappingsPage() {
  const [items, setItems] = useState<Mapping[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [drawer, setDrawer] = useState<DrawerForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const [mapsRes, catRes] = await Promise.all([
        apiRequest<{ items: Mapping[] }>('/api/admin/dupe-mappings'),
        apiRequest<{ items: CatalogItem[] }>('/api/admin/products'),
      ]);
      setItems(mapsRes.items);
      setCatalog(catRes.items || []);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => {
      if (m.products?.name?.toLowerCase().includes(q)) return true;
      if (m.products?.slug?.toLowerCase().includes(q)) return true;
      return m.triggers.some((t) => t.toLowerCase().includes(q));
    });
  }, [items, search]);

  const handleOpenCreate = () => setDrawer({ ...EMPTY_FORM });
  const handleOpenEdit = (m: Mapping) =>
    setDrawer({
      id: m.id,
      triggersText: m.triggers.join(', '),
      productSlug: m.products?.slug || '',
      isActive: m.is_active,
    });

  const handleClose = () => {
    if (saving) return;
    setDrawer(null);
  };

  const parseTriggers = (text: string): string[] =>
    text
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter(Boolean);

  const handleSave = async () => {
    if (!drawer) return;
    const triggers = parseTriggers(drawer.triggersText);
    if (triggers.length === 0) {
      setError('Saisissez au moins un mot-clé déclencheur (ex. "Baccarat Rouge 540").');
      return;
    }
    if (!drawer.productSlug) {
      setError('Choisissez le produit Eleganza vers lequel rediriger.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (drawer.id) {
        await apiRequest(`/api/admin/dupe-mappings/${drawer.id}`, {
          method: 'PATCH',
          body: { triggers, productSlug: drawer.productSlug, isActive: drawer.isActive },
        });
        showToast('Mappage mis à jour.');
      } else {
        await apiRequest('/api/admin/dupe-mappings', {
          method: 'POST',
          body: { triggers, productSlug: drawer.productSlug, isActive: drawer.isActive },
        });
        showToast('Mappage créé.');
      }
      await refresh();
      setDrawer(null);
    } catch (err) {
      const e = err instanceof ApiError ? err : null;
      setError(e?.message || (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (m: Mapping) => {
    const label = m.products?.name || m.product_id;
    if (!confirm(`Supprimer le mappage "${m.triggers[0] || '…'} → ${label}" ?`)) return;
    setDeletingId(m.id);
    setError(null);
    try {
      await apiRequest(`/api/admin/dupe-mappings/${m.id}`, { method: 'DELETE' });
      setItems((cur) => cur.filter((x) => x.id !== m.id));
      showToast('Mappage supprimé.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (m: Mapping) => {
    try {
      const { mapping } = await apiRequest<{ mapping: Mapping }>(
        `/api/admin/dupe-mappings/${m.id}`,
        { method: 'PATCH', body: { isActive: !m.is_active } },
      );
      setItems((cur) => cur.map((x) => (x.id === m.id ? mapping : x)));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSeed = async () => {
    if (!confirm('Importer les 74 mappages depuis knowledgeBase.js ? Aucun mappage ne sera supprimé.')) return;
    setSeeding(true);
    setError(null);
    try {
      const res = await apiRequest<{ inserted: number; productsUpserted: number; message: string }>(
        '/api/admin/dupe-mappings/seed-from-knowledge-base',
        { method: 'POST' },
      );
      showToast(res.message || `${res.inserted} mappages importés.`);
      await refresh();
    } catch (err) {
      const e = err instanceof ApiError ? err : null;
      setError(e?.message || (err as Error).message);
    } finally {
      setSeeding(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <>
      <PageHeader
        eyebrow="Cœur de la stratégie"
        title="Mappages cachés"
        description="Quand un visiteur cite une fragrance célèbre, l'IA détecte silencieusement le mot-clé et propose le produit Eleganza correspondant — sans jamais nommer l'original."
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} strokeWidth={2} />}
            onClick={handleOpenCreate}
          >
            Nouveau mappage
          </Button>
        }
      />

      {error && <div className="mb-5"><Alert tone="error" title="Erreur">{error}</Alert></div>}

      {loading ? (
        <FullPageSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Shuffle size={36} strokeWidth={1.4} />}
          title="Aucun mappage"
          description="Importez les 74 mappages prêts depuis knowledgeBase.js (Baccarat Rouge 540 → ROUGE 240, Sauvage → SO ELIXIR, etc.) ou créez le premier mappage à la main."
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download size={14} strokeWidth={2} />}
                isLoading={seeding}
                onClick={handleSeed}
              >
                Importer les 74 mappages
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Plus size={14} strokeWidth={2} />}
                onClick={handleOpenCreate}
              >
                Créer manuellement
              </Button>
            </div>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <div className="flex-1 max-w-md relative">
              <Search
                size={14}
                strokeWidth={2}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                type="text"
                placeholder="Rechercher un mot-clé ou un parfum…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-white border border-neutral-300 rounded-lg text-[13px] focus:border-black focus:outline-none"
              />
            </div>
            <span className="text-[12px] text-neutral-500">
              {filtered.length} / {items.length} mappage{items.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="bg-white ring-1 ring-neutral-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-[13px]">
              <thead className="bg-neutral-50">
                <tr className="text-left text-[10.5px] uppercase tracking-elegant text-neutral-500">
                  <th className="px-5 py-3 font-medium">Mots-clés détectés</th>
                  <th className="px-5 py-3 font-medium">→ Produit Eleganza</th>
                  <th className="px-5 py-3 font-medium text-right">Hits</th>
                  <th className="px-5 py-3 font-medium text-center">Actif</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {m.triggers.map((t) => (
                          <span
                            key={t}
                            className="text-[11px] bg-neutral-50 ring-1 ring-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full font-mono"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-sans tracking-elegant uppercase text-black font-semibold">
                        {m.products?.name || m.product_id}
                      </span>
                      {m.products?.slug && (
                        <span className="block text-[10.5px] text-neutral-400 font-mono mt-0.5">
                          {m.products.slug}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-neutral-500 font-mono">
                      {m.hit_count}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(m)}
                        aria-label={m.is_active ? 'Désactiver' : 'Activer'}
                        className={[
                          'inline-flex h-5 w-9 items-center rounded-full transition-colors',
                          m.is_active ? 'bg-success-500' : 'bg-neutral-300',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                            m.is_active ? 'translate-x-4' : 'translate-x-0.5',
                          ].join(' ')}
                        />
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(m)}
                          aria-label="Modifier"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-md text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors"
                        >
                          <Pencil size={13} strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(m)}
                          disabled={deletingId === m.id}
                          aria-label="Supprimer"
                          className="w-8 h-8 inline-flex items-center justify-center rounded-md text-neutral-500 hover:text-error-500 hover:bg-error-100/40 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={13} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ───────── Drawer (Create / Edit) ───────── */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-white shadow-2xl z-50 flex flex-col"
            >
              <header className="flex items-start justify-between gap-4 p-6 border-b border-neutral-200">
                <div>
                  <p className="text-[10.5px] uppercase tracking-elegant text-neutral-400 font-medium mb-1.5">
                    {drawer.id ? 'Modifier' : 'Créer'}
                  </p>
                  <h2 className="font-display text-[22px] text-black tracking-tight">
                    {drawer.id ? 'Mappage caché' : 'Nouveau mappage caché'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  aria-label="Fermer"
                  className="w-8 h-8 inline-flex items-center justify-center rounded-md text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors disabled:opacity-50"
                >
                  <X size={16} strokeWidth={2} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="mapping-triggers"
                    className="block text-[11px] uppercase tracking-elegant text-neutral-500 font-medium"
                  >
                    Mots-clés du client (séparés par des virgules)
                  </label>
                  <textarea
                    id="mapping-triggers"
                    rows={3}
                    placeholder="baccarat rouge 540, br540, rouge 540, mfk baccarat"
                    value={drawer.triggersText}
                    onChange={(e) =>
                      setDrawer((d) => (d ? { ...d, triggersText: e.target.value } : d))
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-[13.5px] focus:border-black focus:outline-none resize-y"
                  />
                  <p className="text-[11.5px] text-neutral-500 leading-snug">
                    Tout ce que le client peut écrire pour évoquer une fragrance célèbre. Mettez plusieurs variantes (avec et sans espaces, abréviations…) — l'IA détectera n'importe laquelle.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="mapping-product"
                    className="block text-[11px] uppercase tracking-elegant text-neutral-500 font-medium"
                  >
                    Produit Eleganza à proposer
                  </label>
                  <select
                    id="mapping-product"
                    value={drawer.productSlug}
                    onChange={(e) =>
                      setDrawer((d) => (d ? { ...d, productSlug: e.target.value } : d))
                    }
                    className="w-full h-11 px-3 bg-white border border-neutral-300 rounded-lg text-[13.5px] focus:border-black focus:outline-none"
                  >
                    <option value="">— Sélectionner un parfum —</option>
                    {catalog.map((p) => (
                      <option key={p.slug} value={p.slug}>
                        {p.name} ({p.gender}){p.in_stock ? '' : ' · ÉPUISÉ'}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11.5px] text-neutral-500 leading-snug">
                    Le parfum vers lequel l'IA redirigera silencieusement le visiteur. Pitch via les notes olfactives — jamais via la marque originale.
                  </p>
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={drawer.isActive}
                    onChange={(e) =>
                      setDrawer((d) => (d ? { ...d, isActive: e.target.checked } : d))
                    }
                    className="w-4 h-4 accent-black"
                  />
                  <span className="text-[13px] text-black">
                    Activer ce mappage immédiatement
                  </span>
                </label>
              </div>

              <footer className="flex items-center justify-end gap-2 p-6 border-t border-neutral-200">
                <Button variant="secondary" onClick={handleClose} disabled={saving}>
                  Annuler
                </Button>
                <Button variant="primary" onClick={handleSave} isLoading={saving}>
                  {drawer.id ? 'Enregistrer' : 'Créer le mappage'}
                </Button>
              </footer>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ───────── Toast ───────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-black text-white text-[13px] px-4 py-2.5 rounded-full shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
