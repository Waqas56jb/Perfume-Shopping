import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Download, Mail, Phone, UsersRound, MapPin, Package, CheckCircle2, XCircle, Clock,
  ChevronRight, ExternalLink, MessageSquare, Calendar, Hash,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FullPageSpinner, Spinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Drawer } from '../components/Drawer';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { apiRequest, apiDownload } from '../lib/api';
import { formatDate } from '../lib/format';

type LeadStatus = 'new' | 'contacted' | 'delivered' | 'cancelled';

interface Lead {
  id: string;
  session_id: string | null;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  source: string;
  status: LeadStatus;
  product_ids: string[];
  product_names: string[];
  total_amount: number | null;
  currency: string | null;
  marketing_opt_in: boolean;
  notes: string | null;
  created_at: string;
  updated_at?: string;
}

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
  price: number;
  old_price: number | null;
  currency: string;
  in_stock: boolean;
  url: string | null;
}

const STATUS_FILTERS: { value: LeadStatus | ''; label: string }[] = [
  { value: '',          label: 'Tous' },
  { value: 'new',       label: 'À traiter' },
  { value: 'delivered', label: 'Livrés' },
  { value: 'cancelled', label: 'Annulés' },
];

const STATUS_META: Record<LeadStatus, { label: string; bg: string; text: string; Icon: typeof Clock }> = {
  new:       { label: 'À traiter', bg: 'bg-gold-100',    text: 'text-gold-700',    Icon: Clock },
  contacted: { label: 'Contacté',  bg: 'bg-neutral-100', text: 'text-neutral-600', Icon: Clock },
  delivered: { label: 'Livré',     bg: 'bg-success-100', text: 'text-success-500', Icon: CheckCircle2 },
  cancelled: { label: 'Annulé',    bg: 'bg-error-100',   text: 'text-error-500',   Icon: XCircle },
};

export function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');

  // Detail drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detail, setDetail] = useState<{ lead: Lead; products: Product[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Status actions
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Lead | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : '';
      const r = await apiRequest<{ items: Lead[] }>(`/api/admin/leads${qs}`);
      setItems(r.items);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [statusFilter]);

  const openDetail = async (lead: Lead) => {
    setDrawerOpen(true);
    setLoadingDetail(true);
    setDetail({ lead, products: [] }); // optimistic — show what we already have
    try {
      const r = await apiRequest<{ lead: Lead; products: Product[] }>(`/api/admin/leads/${lead.id}`);
      setDetail(r);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setDrawerOpen(false);
    setTimeout(() => setDetail(null), 250);
  };

  const handleExport = async () => {
    setDownloading(true);
    try {
      await apiDownload('/api/admin/leads/export.csv', `eleganza-prospects-${Date.now()}.csv`);
    } catch (err) { setError((err as Error).message); }
    finally { setDownloading(false); }
  };

  const updateStatus = async (lead: Lead, status: LeadStatus, successMsg: string) => {
    setBusyId(lead.id);
    setError(null);
    setSuccess(null);
    try {
      const r = await apiRequest<{ lead: Lead }>(`/api/admin/leads/${lead.id}/status`, {
        method: 'PATCH',
        body: { status },
      });
      setSuccess(successMsg);
      await load();
      // Keep drawer in sync if it's showing this lead
      if (detail?.lead?.id === lead.id) {
        setDetail((d) => (d ? { ...d, lead: r.lead } : d));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const markDelivered = (lead: Lead) =>
    updateStatus(lead, 'delivered', `Commande de ${lead.name || lead.email} marquée comme livrée.`);

  const cancelOrder = async () => {
    if (!confirmCancel) return;
    await updateStatus(confirmCancel, 'cancelled', `Commande de ${confirmCancel.name || confirmCancel.email} annulée.`);
    setConfirmCancel(null);
  };

  const fmtMoney = (n: number | null, ccy: string | null) =>
    n != null
      ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: ccy || 'USD', maximumFractionDigits: 0 }).format(n)
      : '—';

  return (
    <>
      <PageHeader
        eyebrow="Acquisition"
        title="Prospects capturés"
        description="Cliquez sur un prospect pour voir le détail complet de sa commande. Marquez livré ou annulez depuis le panneau de détail."
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Download size={15} strokeWidth={2} />}
            onClick={handleExport}
            isLoading={downloading}
            disabled={items.length === 0}
          >
            Exporter CSV
          </Button>
        }
      />

      {error && <div className="mb-5"><Alert tone="error" title="Erreur">{error}</Alert></div>}
      {success && <div className="mb-5"><Alert tone="success" title="Confirmé">{success}</Alert></div>}

      {/* Status filter */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-0.5 bg-white border border-neutral-300 rounded-lg p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value || 'all'}
              onClick={() => setStatusFilter(s.value)}
              className={[
                'px-3.5 py-1.5 rounded-md text-[12px] tracking-wider uppercase transition-colors',
                statusFilter === s.value ? 'bg-black text-white' : 'text-neutral-500 hover:text-black',
              ].join(' ')}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="text-[12px] text-neutral-500 ml-auto">{items.length} prospect{items.length > 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <FullPageSpinner label="Chargement…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<UsersRound size={32} strokeWidth={1.4} />}
          title="Aucun prospect"
          description={
            statusFilter
              ? `Aucun prospect avec le statut « ${STATUS_FILTERS.find((s) => s.value === statusFilter)?.label} ».`
              : "Dès qu'un visiteur partage son e-mail via le conseiller, il apparaîtra ici."
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              onOpen={() => openDetail(lead)}
              fmtMoney={fmtMoney}
            />
          ))}
        </div>
      )}

      {/* ─── Detail drawer ─── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDetail}
        title="Détail du prospect"
        subtitle={detail?.lead?.name || detail?.lead?.email}
        width="xl"
        footer={
          detail && detail.lead.status !== 'delivered' && detail.lead.status !== 'cancelled' ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setConfirmCancel(detail.lead)}
                disabled={busyId === detail.lead.id}
                leftIcon={<XCircle size={15} strokeWidth={2} />}
              >
                Annuler la commande
              </Button>
              <Button
                variant="primary"
                onClick={() => markDelivered(detail.lead)}
                isLoading={busyId === detail.lead.id}
                leftIcon={<CheckCircle2 size={15} strokeWidth={2} />}
              >
                Marquer livré
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={closeDetail}>Fermer</Button>
          )
        }
      >
        {detail ? (
          <LeadDetail
            data={detail}
            loadingDetail={loadingDetail}
            fmtMoney={fmtMoney}
          />
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={Boolean(confirmCancel)}
        title="Annuler cette commande ?"
        message={`Cette action marquera la commande de ${confirmCancel?.name || confirmCancel?.email} comme « Annulée ». Elle restera visible dans la liste pour traçabilité.`}
        confirmLabel="Annuler la commande"
        cancelLabel="Retour"
        danger
        busy={busyId === confirmCancel?.id}
        onConfirm={cancelOrder}
        onCancel={() => setConfirmCancel(null)}
      />
    </>
  );
}

/* ─── Row card — compact summary, fully clickable ─── */
interface LeadRowProps {
  lead: Lead;
  onOpen: () => void;
  fmtMoney: (n: number | null, ccy: string | null) => string;
}

function LeadRow({ lead, onOpen, fmtMoney }: LeadRowProps) {
  const meta = STATUS_META[lead.status] || STATUS_META.new;
  const StatusIcon = meta.Icon;
  const primaryProduct = lead.product_names?.[0];
  const moreCount = (lead.product_names?.length || 0) - 1;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="
        block w-full text-left bg-white border border-neutral-200 rounded-xl
        hover:border-gold-300 hover:shadow-card focus:outline-none focus-visible:ring-2
        focus-visible:ring-gold-400 focus-visible:ring-offset-2 transition-all
      "
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.2fr_1fr_auto] gap-6 px-5 lg:px-6 py-5 items-center">
        {/* Customer */}
        <div className="min-w-0">
          <p className="text-[10.5px] uppercase tracking-elegant text-neutral-400 font-medium mb-1.5">Client</p>
          {lead.name && (
            <p className="text-[15px] text-black font-semibold leading-tight mb-1.5 truncate">{lead.name}</p>
          )}
          <div className="space-y-1 text-[12.5px] text-neutral-600">
            <div className="flex items-center gap-1.5 min-w-0">
              <Mail size={12} strokeWidth={1.8} className="text-neutral-400 flex-shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={12} strokeWidth={1.8} className="text-neutral-400 flex-shrink-0" />
                <span>{lead.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Order */}
        <div className="min-w-0">
          <p className="text-[10.5px] uppercase tracking-elegant text-neutral-400 font-medium mb-1.5">Commande</p>
          {primaryProduct ? (
            <div className="flex items-center gap-2 text-[13px] text-black">
              <Package size={13} strokeWidth={1.8} className="text-neutral-400 flex-shrink-0" />
              <span className="font-sans tracking-elegant uppercase font-medium truncate">{primaryProduct}</span>
              {moreCount > 0 && (
                <span className="text-[10.5px] text-neutral-400 uppercase tracking-wider flex-shrink-0">
                  +{moreCount}
                </span>
              )}
            </div>
          ) : (
            <p className="text-[12.5px] text-neutral-400 italic">Pas de parfum précis</p>
          )}
          {lead.address && (
            <div className="flex items-start gap-1.5 mt-1.5 text-[11.5px] text-neutral-500">
              <MapPin size={11} strokeWidth={1.8} className="text-neutral-400 flex-shrink-0 mt-0.5" />
              <span className="truncate">{lead.address}</span>
            </div>
          )}
        </div>

        {/* Amount + status */}
        <div className="min-w-0">
          <p className="text-[10.5px] uppercase tracking-elegant text-neutral-400 font-medium mb-1.5">Montant</p>
          <p className="font-display text-[26px] text-gold-600 leading-none tracking-tight">
            {fmtMoney(lead.total_amount, lead.currency)}
          </p>
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <span className={['inline-flex items-center gap-1 text-[10.5px] uppercase tracking-wider px-2 py-1 rounded-md', meta.bg, meta.text].join(' ')}>
              <StatusIcon size={11} strokeWidth={2.2} />
              {meta.label}
            </span>
            <span className="text-[10.5px] text-neutral-400 uppercase tracking-wider">
              {formatDate(lead.created_at)}
            </span>
          </div>
        </div>

        {/* Chevron — "click to see more" affordance */}
        <div className="text-neutral-300 lg:pl-2">
          <ChevronRight size={20} strokeWidth={1.6} />
        </div>
      </div>
    </button>
  );
}

/* ─── Full detail panel — rendered inside the drawer ─── */
interface LeadDetailProps {
  data: { lead: Lead; products: Product[] };
  loadingDetail: boolean;
  fmtMoney: (n: number | null, ccy: string | null) => string;
}

function LeadDetail({ data, loadingDetail, fmtMoney }: LeadDetailProps) {
  const { lead, products } = data;
  const meta = STATUS_META[lead.status] || STATUS_META.new;
  const StatusIcon = meta.Icon;

  // Total fallback: if total_amount is null but we have products, recompute.
  const recomputedTotal = products.reduce((s, p) => s + (Number(p.price) || 0), 0);
  const displayTotal = lead.total_amount ?? (products.length > 0 ? recomputedTotal : null);

  return (
    <div className="space-y-7">
      {/* ─ Status & timestamps ─ */}
      <section>
        <SectionHeader label="Statut" />
        <div className="flex items-center gap-3 flex-wrap">
          <span className={['inline-flex items-center gap-1.5 text-[12px] uppercase tracking-wider px-3 py-1.5 rounded-md', meta.bg, meta.text].join(' ')}>
            <StatusIcon size={13} strokeWidth={2.2} />
            {meta.label}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-neutral-500">
            <Calendar size={11} strokeWidth={1.8} /> Capturé le {formatDate(lead.created_at)}
          </span>
          {lead.updated_at && lead.updated_at !== lead.created_at && (
            <span className="text-[11.5px] text-neutral-400">
              Mis à jour {formatDate(lead.updated_at)}
            </span>
          )}
        </div>
      </section>

      {/* ─ Customer ─ */}
      <section>
        <SectionHeader label="Coordonnées client" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <KV label="Nom complet" value={lead.name || '—'} />
          <KV
            label="Adresse e-mail"
            value={
              <a href={`mailto:${lead.email}`} className="text-black hover:underline underline-offset-4">
                {lead.email}
              </a>
            }
          />
          <KV
            label="Téléphone"
            value={
              lead.phone ? (
                <a href={`tel:${lead.phone}`} className="text-black hover:underline underline-offset-4">{lead.phone}</a>
              ) : '—'
            }
          />
          <KV
            label="Source"
            value={<span className="capitalize">{lead.source}</span>}
          />
        </div>
        {lead.address && (
          <div className="mt-3">
            <KV
              label="Adresse de livraison"
              value={
                <span className="flex items-start gap-1.5">
                  <MapPin size={12} strokeWidth={1.8} className="text-neutral-400 flex-shrink-0 mt-1" />
                  {lead.address}
                </span>
              }
            />
          </div>
        )}
      </section>

      {/* ─ Products / order ─ */}
      <section>
        <SectionHeader label={`Parfum${products.length > 1 ? 's' : ''} commandé${products.length > 1 ? 's' : ''}`} />
        {loadingDetail ? (
          <div className="py-4"><Spinner label="Chargement des parfums…" /></div>
        ) : products.length === 0 ? (
          <p className="text-[13px] text-neutral-500 italic">
            {lead.product_names?.length
              ? `Référence(s) enregistrée(s) : ${lead.product_names.join(', ')} (produit(s) introuvable(s) dans le catalogue actuel).`
              : 'Aucun parfum spécifique enregistré pour ce prospect.'}
          </p>
        ) : (
          <ul className="space-y-2.5">
            {products.map((p) => (
              <li key={p.id}>
                <article className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-gold-300 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-sans tracking-elegant uppercase text-[13.5px] text-black font-semibold">
                          {p.name}
                        </h4>
                        <span className="text-[10.5px] uppercase tracking-wider text-neutral-400">
                          {p.family}
                        </span>
                      </div>
                      {p.tagline && (
                        <p className="text-[12.5px] text-neutral-600 italic leading-snug">{p.tagline}</p>
                      )}
                      <div className="mt-2 space-y-0.5 text-[11.5px] text-neutral-500">
                        {p.notes_tete?.length > 0 && <p><span className="text-neutral-400 uppercase tracking-wider text-[10px] mr-2">Tête</span>{p.notes_tete.join(' · ')}</p>}
                        {p.notes_coeur?.length > 0 && <p><span className="text-neutral-400 uppercase tracking-wider text-[10px] mr-2">Cœur</span>{p.notes_coeur.join(' · ')}</p>}
                        {p.notes_fond?.length > 0 && <p><span className="text-neutral-400 uppercase tracking-wider text-[10px] mr-2">Fond</span>{p.notes_fond.join(' · ')}</p>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-display text-[20px] text-black leading-none">
                        {fmtMoney(Number(p.price), p.currency)}
                      </p>
                      {p.old_price && (
                        <p className="text-[10.5px] text-neutral-400 line-through mt-1">
                          {fmtMoney(Number(p.old_price), p.currency)}
                        </p>
                      )}
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10.5px] text-neutral-500 hover:text-black mt-2"
                        >
                          Fiche produit <ExternalLink size={10} strokeWidth={2} />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}

        {/* Total */}
        {displayTotal != null && (
          <div className="mt-4 flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-4">
            <span className="text-[11px] uppercase tracking-elegant text-neutral-500 font-medium">
              Total à facturer
            </span>
            <span className="font-display text-[24px] text-gold-600 leading-none tracking-tight">
              {fmtMoney(displayTotal, lead.currency)}
            </span>
          </div>
        )}
      </section>

      {/* ─ Notes captured by the AI ─ */}
      {lead.notes && (
        <section>
          <SectionHeader label="Notes du conseiller IA" />
          <div className="bg-neutral-50 border-l-2 border-gold-400 px-4 py-3 rounded-r-lg">
            <p className="text-[13px] text-neutral-700 italic leading-relaxed whitespace-pre-wrap">
              {lead.notes}
            </p>
          </div>
        </section>
      )}

      {/* ─ Session reference ─ */}
      <section>
        <SectionHeader label="Conversation" />
        {lead.session_id ? (
          <Link
            to={`/conversations/${lead.session_id}`}
            className="inline-flex items-center gap-2 text-[13px] text-black hover:text-gold-600 transition-colors group"
          >
            <MessageSquare size={14} strokeWidth={1.8} />
            <span className="underline underline-offset-4 decoration-neutral-300 group-hover:decoration-gold-400">
              Voir la conversation complète
            </span>
            <ChevronRight size={14} strokeWidth={2} className="text-neutral-400 group-hover:text-gold-600" />
          </Link>
        ) : (
          <p className="text-[12.5px] text-neutral-400">
            Aucune conversation rattachée (lead ajouté manuellement ou session supprimée).
          </p>
        )}
        <div className="mt-2 text-[10.5px] text-neutral-400 flex items-center gap-1.5 font-mono">
          <Hash size={10} strokeWidth={2} />
          {lead.id.slice(0, 8)}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <h3 className="text-[10.5px] uppercase tracking-elegant text-neutral-400 font-medium mb-3 pb-2 border-b border-neutral-200">
      {label}
    </h3>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-lg px-4 py-3">
      <p className="text-[10px] uppercase tracking-elegant text-neutral-400 font-medium mb-1">{label}</p>
      <div className="text-[13.5px] text-black">{value}</div>
    </div>
  );
}
