import { useEffect, useState, type FormEvent } from 'react';
import {
  Boxes, ExternalLink, Search, Plus, Pencil, Trash2, Star, Sparkles, Package,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FullPageSpinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Drawer } from '../components/Drawer';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { apiRequest } from '../lib/api';

interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  family: string | null;
  gender: 'F' | 'H' | 'U';
  notes_tete: string[];
  notes_coeur: string[];
  notes_fond: string[];
  season: string[];
  intensity: number | null;
  sillage: number | null;
  longevity: number | null;
  occasions: string[];
  vibe: string | null;
  price: number;
  old_price: number | null;
  currency: string;
  in_stock: boolean;
  is_bestseller: boolean;
  is_new: boolean;
  url: string | null;
  image_url: string | null;
  sort_order: number;
}

const GENDER_LABEL: Record<string, string> = { F: 'Femme', H: 'Homme', U: 'Mixte' };

// Empty product template for "create" mode
const blankProduct: Partial<Product> = {
  name: '',
  tagline: '',
  family: '',
  gender: 'U',
  notes_tete: [],
  notes_coeur: [],
  notes_fond: [],
  season: [],
  intensity: 4,
  sillage: 4,
  longevity: 4,
  occasions: [],
  vibe: '',
  price: 24,
  old_price: null,
  in_stock: true,
  is_bestseller: false,
  is_new: false,
  url: '',
};

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'' | 'F' | 'H' | 'U'>('');

  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await apiRequest<{ items: Product[] }>('/api/admin/products?inStockOnly=false');
      setItems(r.items);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter((p) => {
    if (genderFilter && p.gender !== genderFilter) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.family?.toLowerCase().includes(q) ||
      [...p.notes_tete, ...p.notes_coeur, ...p.notes_fond].some((n) => n.toLowerCase().includes(q))
    );
  });

  const openCreate = () => {
    setEditing({ ...blankProduct });
    setDrawerOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing({ ...p });
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    if (busy) return;
    setDrawerOpen(false);
    setTimeout(() => setEditing(null), 250);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setError(null);
    try {
      if (editing.slug) {
        await apiRequest(`/api/admin/products/${editing.slug}`, {
          method: 'PATCH',
          body: editing,
        });
        setSuccess(`« ${editing.name} » mis à jour.`);
      } else {
        await apiRequest('/api/admin/products', {
          method: 'POST',
          body: editing,
        });
        setSuccess(`« ${editing.name} » ajouté au catalogue. Le chatbot le connaît immédiatement.`);
      }
      closeDrawer();
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await apiRequest(`/api/admin/products/${confirmDelete.slug}`, { method: 'DELETE' });
      setSuccess(`« ${confirmDelete.name} » supprimé.`);
      setConfirmDelete(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Catalogue"
        title="Parfums Eleganza"
        description="Ajoutez, modifiez ou retirez des fragrances. Le conseiller IA est automatiquement formé sur la mise à jour."
        actions={
          <Button variant="gold" size="md" leftIcon={<Plus size={15} strokeWidth={2.2} />} onClick={openCreate}>
            Nouveau parfum
          </Button>
        }
      />

      {error && <div className="mb-5"><Alert tone="error" title="Erreur">{error}</Alert></div>}
      {success && <div className="mb-5"><Alert tone="success" title="Confirmé">{success}</Alert></div>}

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-neutral-300 rounded-lg px-3.5 h-10 flex-1 max-w-md focus-within:border-black transition-colors">
          <Search size={15} className="text-neutral-400" strokeWidth={1.8} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, famille, note olfactive…"
            className="flex-1 bg-transparent text-[13.5px] text-black placeholder:text-neutral-400 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-neutral-300 rounded-lg p-1">
          {(['', 'F', 'H', 'U'] as const).map((g) => (
            <button
              key={g || 'all'}
              onClick={() => setGenderFilter(g)}
              className={[
                'px-3 py-1.5 rounded-md text-[11.5px] tracking-wider uppercase transition-colors',
                genderFilter === g ? 'bg-black text-white' : 'text-neutral-500 hover:text-black',
              ].join(' ')}
            >
              {g === '' ? 'Tous' : GENDER_LABEL[g]}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-neutral-500 ml-auto">{filtered.length} / {items.length}</span>
      </div>

      {loading ? (
        <FullPageSpinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Boxes size={32} strokeWidth={1.4} />}
          title={items.length === 0 ? "Catalogue vide" : 'Aucun résultat'}
          description={
            items.length === 0
              ? 'Ajoutez votre premier parfum. Le conseiller IA en sera immédiatement informé.'
              : 'Aucun parfum ne correspond à votre recherche.'
          }
          action={
            items.length === 0 ? (
              <Button variant="gold" leftIcon={<Plus size={15} strokeWidth={2.2} />} onClick={openCreate}>
                Ajouter un parfum
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onEdit={() => openEdit(p)} onDelete={() => setConfirmDelete(p)} />
          ))}
        </div>
      )}

      {/* Edit / create drawer */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editing?.slug ? 'Modifier le parfum' : 'Nouveau parfum'}
        subtitle={
          editing?.slug
            ? `Slug : ${editing.slug} · les modifications sont prises en compte immédiatement par le conseiller IA.`
            : "Le conseiller sera entraîné sur ce parfum dès son enregistrement."
        }
        width="xl"
        footer={
          <>
            <Button variant="ghost" onClick={closeDrawer} disabled={busy}>Annuler</Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={busy}>
              {editing?.slug ? 'Enregistrer' : 'Créer le parfum'}
            </Button>
          </>
        }
      >
        {editing && <ProductForm value={editing} onChange={setEditing} onSubmit={handleSubmit} />}
      </Drawer>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Supprimer ce parfum ?"
        message={`Cette action est irréversible. Le conseiller cessera de recommander « ${confirmDelete?.name} » immédiatement.`}
        confirmLabel="Supprimer"
        danger
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}

/* ─── Product card ─── */
function ProductCard({ product: p, onEdit, onDelete }: { product: Product; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className="group bg-white border border-neutral-200 rounded-xl p-5 shadow-card hover:border-gold-300 hover:shadow-gold transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-sans tracking-elegant uppercase text-[13.5px] text-black font-semibold">
              {p.name}
            </h3>
            {p.is_bestseller && (
              <span className="inline-flex items-center gap-1 text-[9.5px] uppercase tracking-wider bg-gold-100 text-gold-600 px-1.5 py-0.5 rounded">
                <Star size={9} strokeWidth={2.4} /> Best
              </span>
            )}
            {p.is_new && (
              <span className="inline-flex items-center gap-1 text-[9.5px] uppercase tracking-wider bg-black text-white px-1.5 py-0.5 rounded">
                <Sparkles size={9} strokeWidth={2.4} /> Nouveau
              </span>
            )}
          </div>
          <p className="text-[11px] text-neutral-500">{p.family} · {GENDER_LABEL[p.gender]}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[16px] font-semibold text-black">${Number(p.price).toFixed(0)}</p>
          {p.old_price && <p className="text-[10.5px] text-neutral-400 line-through">${Number(p.old_price).toFixed(0)}</p>}
        </div>
      </div>

      {p.tagline && <p className="text-[12.5px] text-neutral-600 italic leading-snug mb-3 line-clamp-2">{p.tagline}</p>}

      <div className="space-y-1.5 text-[11.5px] mb-4">
        <NotesRow label="Tête" notes={p.notes_tete} />
        <NotesRow label="Cœur" notes={p.notes_coeur} />
        <NotesRow label="Fond" notes={p.notes_fond} />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
        <span className={[
          'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded',
          p.in_stock ? 'bg-success-100 text-success-500' : 'bg-error-100 text-error-500',
        ].join(' ')}>
          {p.in_stock ? 'En stock' : 'Épuisé'}
        </span>
        <div className="flex items-center gap-1">
          {p.url && (
            <a href={p.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors flex items-center justify-center" aria-label="Voir sur le site">
              <ExternalLink size={13} strokeWidth={1.8} />
            </a>
          )}
          <button type="button" onClick={onEdit} className="w-8 h-8 rounded-md text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors flex items-center justify-center" aria-label="Modifier">
            <Pencil size={13} strokeWidth={1.8} />
          </button>
          <button type="button" onClick={onDelete} className="w-8 h-8 rounded-md text-neutral-400 hover:text-error-500 hover:bg-error-100 transition-colors flex items-center justify-center" aria-label="Supprimer">
            <Trash2 size={13} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </article>
  );
}

function NotesRow({ label, notes }: { label: string; notes: string[] }) {
  if (!notes?.length) return null;
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] uppercase tracking-elegant text-neutral-400 w-10 flex-shrink-0">{label}</span>
      <span className="text-neutral-700">{notes.join(' · ')}</span>
    </div>
  );
}

/* ─── Form ─── */
interface ProductFormProps {
  value: Partial<Product>;
  onChange: (next: Partial<Product>) => void;
  onSubmit: (e: FormEvent) => void;
}

function ProductForm({ value, onChange, onSubmit }: ProductFormProps) {
  const set = (patch: Partial<Product>) => onChange({ ...value, ...patch });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Section icon={<Package size={15} strokeWidth={1.8} />} title="Identité du parfum">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nom*"
            placeholder="ROUGE 240"
            value={value.name || ''}
            onChange={(e) => set({ name: e.target.value })}
            required
          />
          <SelectField
            label="Genre"
            value={value.gender || 'U'}
            onChange={(v) => set({ gender: v as 'F' | 'H' | 'U' })}
            options={[
              { value: 'F', label: 'Femme' },
              { value: 'H', label: 'Homme' },
              { value: 'U', label: 'Mixte / unisexe' },
            ]}
          />
        </div>
        <Input
          label="Slogan / Tagline"
          placeholder="L'Éclat Royal — sillage solaire et ambré"
          value={value.tagline || ''}
          onChange={(e) => set({ tagline: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Famille olfactive"
            placeholder="Ambré Floral Boisé"
            value={value.family || ''}
            onChange={(e) => set({ family: e.target.value })}
          />
          <Input
            label="Vibe / Mood"
            placeholder="luxueux, sensuel, mémorable"
            value={value.vibe || ''}
            onChange={(e) => set({ vibe: e.target.value })}
          />
        </div>
      </Section>

      <Section icon={<Sparkles size={15} strokeWidth={1.8} />} title="Pyramide olfactive">
        <TagInput
          label="Notes de tête"
          tags={value.notes_tete || []}
          onChange={(notes_tete) => set({ notes_tete })}
          placeholder="Jasmin, Safran… (Entrée pour ajouter)"
        />
        <TagInput
          label="Notes de cœur"
          tags={value.notes_coeur || []}
          onChange={(notes_coeur) => set({ notes_coeur })}
          placeholder="Ambre, Bois de cèdre…"
        />
        <TagInput
          label="Notes de fond"
          tags={value.notes_fond || []}
          onChange={(notes_fond) => set({ notes_fond })}
          placeholder="Musc, Résine de sapin…"
        />
      </Section>

      <Section title="Saison & occasion">
        <TagInput
          label="Saison"
          tags={value.season || []}
          onChange={(season) => set({ season })}
          placeholder="Automne, Hiver…"
          suggestions={['Printemps', 'Été', 'Automne', 'Hiver', 'Toutes saisons']}
        />
        <TagInput
          label="Occasions"
          tags={value.occasions || []}
          onChange={(occasions) => set({ occasions })}
          placeholder="soirée élégante, signature…"
        />
        <div className="grid grid-cols-3 gap-3">
          <NumberSlider label="Intensité" value={value.intensity ?? 4} onChange={(intensity) => set({ intensity })} />
          <NumberSlider label="Sillage"   value={value.sillage   ?? 4} onChange={(sillage)   => set({ sillage })}   />
          <NumberSlider label="Tenue"     value={value.longevity ?? 4} onChange={(longevity) => set({ longevity })} />
        </div>
      </Section>

      <Section title="Commerce">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Prix (USD)*"
            type="number"
            min="0"
            step="0.01"
            value={String(value.price ?? '')}
            onChange={(e) => set({ price: parseFloat(e.target.value) })}
          />
          <Input
            label="Prix barré (USD) — promotion"
            type="number"
            min="0"
            step="0.01"
            value={value.old_price ? String(value.old_price) : ''}
            onChange={(e) => set({ old_price: e.target.value ? parseFloat(e.target.value) : null })}
            hint="Laisser vide si pas de promo"
          />
        </div>
        <Input
          label="URL produit (eleganza-parfums.com)"
          type="url"
          placeholder="https://eleganza-parfums.com/products/…"
          value={value.url || ''}
          onChange={(e) => set({ url: e.target.value })}
        />
        <div className="flex flex-wrap gap-4 pt-2">
          <Toggle label="En stock" checked={value.in_stock ?? true} onChange={(in_stock) => set({ in_stock })} />
          <Toggle label="Best-seller" checked={value.is_bestseller ?? false} onChange={(is_bestseller) => set({ is_bestseller })} />
          <Toggle label="Nouveauté" checked={value.is_new ?? false} onChange={(is_new) => set({ is_new })} />
        </div>
      </Section>
    </form>
  );
}

function Section({ icon, title, children }: { icon?: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h3 className="flex items-center gap-2 text-[11px] uppercase tracking-elegant text-neutral-400 font-medium pb-2 border-b border-neutral-200">
        {icon}{title}
      </h3>
      {children}
    </section>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] uppercase tracking-elegant text-neutral-500 font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-3.5 bg-white border border-neutral-300 rounded-lg text-[14px] text-black focus:outline-none focus:border-black cursor-pointer"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={[
          'relative w-9 h-5 rounded-full transition-colors',
          checked ? 'bg-black' : 'bg-neutral-300',
        ].join(' ')}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={[
            'absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all',
            checked ? 'left-[18px]' : 'left-0.5',
          ].join(' ')}
        />
      </button>
      <span className="text-[13px] text-black">{label}</span>
    </label>
  );
}

function NumberSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] uppercase tracking-elegant text-neutral-500 font-medium">
        {label} <span className="text-gold-500 font-mono">{value}/5</span>
      </label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={[
              'flex-1 h-2 rounded-full transition-colors',
              n <= value ? 'bg-gold-400' : 'bg-neutral-200 hover:bg-neutral-300',
            ].join(' ')}
            aria-label={`${label} ${n}`}
          />
        ))}
      </div>
    </div>
  );
}

function TagInput({ label, tags, onChange, placeholder, suggestions }: { label: string; tags: string[]; onChange: (next: string[]) => void; placeholder?: string; suggestions?: string[] }) {
  const [draft, setDraft] = useState('');
  const add = (raw: string) => {
    const v = raw.trim();
    if (!v) return;
    if (tags.includes(v)) return;
    onChange([...tags, v]);
    setDraft('');
  };
  const remove = (idx: number) => onChange(tags.filter((_, i) => i !== idx));

  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] uppercase tracking-elegant text-neutral-500 font-medium">{label}</label>
      <div className="bg-white border border-neutral-300 rounded-lg p-2 focus-within:border-black transition-colors">
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t, i) => (
            <span key={`${t}-${i}`} className="inline-flex items-center gap-1 bg-neutral-100 text-[12px] text-black px-2 py-1 rounded-md">
              {t}
              <button type="button" onClick={() => remove(i)} aria-label="Retirer" className="text-neutral-400 hover:text-black">
                ×
              </button>
            </span>
          ))}
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                add(draft);
              } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
                remove(tags.length - 1);
              }
            }}
            placeholder={tags.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent text-[13px] text-black placeholder:text-neutral-400 focus:outline-none px-1"
          />
        </div>
      </div>
      {suggestions && (
        <div className="flex flex-wrap gap-1">
          {suggestions.filter((s) => !tags.includes(s)).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="text-[10.5px] text-neutral-400 hover:text-black border border-neutral-200 hover:border-neutral-400 px-2 py-0.5 rounded-md transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
