import { useEffect, useState } from 'react';
import {
  Download, Mail, Phone, UsersRound, MapPin, Package, CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FullPageSpinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { apiRequest, apiDownload } from '../lib/api';
import { formatDate } from '../lib/format';

type LeadStatus = 'new' | 'contacted' | 'delivered' | 'cancelled';

interface Lead {
  id: string;
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
      await apiRequest(`/api/admin/leads/${lead.id}/status`, {
        method: 'PATCH',
        body: { status },
      });
      setSuccess(successMsg);
      await load();
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
        description="Les détails recueillis par le conseiller IA. Marquez les commandes comme livrées ou annulées dès qu'elles sont traitées."
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

      {/* Status filter chips */}
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
        /* Card layout — much more readable than a wide table for orders */
        <div className="space-y-3">
          {items.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              busy={busyId === lead.id}
              onDelivered={() => markDelivered(lead)}
              onCancel={() => setConfirmCancel(lead)}
              fmtMoney={fmtMoney}
            />
          ))}
        </div>
      )}

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

/* ─── Single lead card — full order detail + actions ─── */
interface LeadCardProps {
  lead: Lead;
  busy: boolean;
  onDelivered: () => void;
  onCancel: () => void;
  fmtMoney: (n: number | null, ccy: string | null) => string;
}

function LeadCard({ lead, busy, onDelivered, onCancel, fmtMoney }: LeadCardProps) {
  const meta = STATUS_META[lead.status] || STATUS_META.new;
  const StatusIcon = meta.Icon;
  const isClosed = lead.status === 'delivered' || lead.status === 'cancelled';

  return (
    <article className="bg-white border border-neutral-200 rounded-xl shadow-card hover:border-neutral-300 transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.2fr_1fr_auto] gap-6 px-5 lg:px-6 py-5">
        {/* ─ Customer ─ */}
        <div className="min-w-0">
          <p className="text-[10.5px] uppercase tracking-elegant text-neutral-400 font-medium mb-1.5">
            Client
          </p>
          {lead.name && (
            <p className="text-[15px] text-black font-semibold leading-tight mb-1.5">{lead.name}</p>
          )}
          <div className="space-y-1 text-[12.5px] text-neutral-600">
            <div className="flex items-center gap-1.5 min-w-0">
              <Mail size={12} strokeWidth={1.8} className="text-neutral-400 flex-shrink-0" />
              <a href={`mailto:${lead.email}`} className="hover:text-black truncate">
                {lead.email}
              </a>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-1.5">
                <Phone size={12} strokeWidth={1.8} className="text-neutral-400 flex-shrink-0" />
                <a href={`tel:${lead.phone}`} className="hover:text-black">{lead.phone}</a>
              </div>
            )}
            {lead.address && (
              <div className="flex items-start gap-1.5">
                <MapPin size={12} strokeWidth={1.8} className="text-neutral-400 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{lead.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* ─ Order ─ */}
        <div className="min-w-0">
          <p className="text-[10.5px] uppercase tracking-elegant text-neutral-400 font-medium mb-1.5">
            Commande
          </p>
          {lead.product_names && lead.product_names.length > 0 ? (
            <ul className="space-y-1">
              {lead.product_names.map((name, i) => (
                <li key={`${name}-${i}`} className="flex items-center gap-1.5 text-[13px] text-black">
                  <Package size={12} strokeWidth={1.8} className="text-neutral-400 flex-shrink-0" />
                  <span className="font-sans tracking-elegant uppercase font-medium">{name}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[12.5px] text-neutral-400 italic">Pas de parfum précis</p>
          )}
          {lead.notes && (
            <p className="text-[11px] text-neutral-500 mt-2 leading-snug italic line-clamp-2">{lead.notes}</p>
          )}
        </div>

        {/* ─ Amount + Status + Date ─ */}
        <div className="min-w-0">
          <p className="text-[10.5px] uppercase tracking-elegant text-neutral-400 font-medium mb-1.5">
            Montant
          </p>
          <p className="font-display text-[26px] text-gold-600 leading-none tracking-tight">
            {fmtMoney(lead.total_amount, lead.currency)}
          </p>

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className={['inline-flex items-center gap-1 text-[10.5px] uppercase tracking-wider px-2 py-1 rounded-md', meta.bg, meta.text].join(' ')}>
              <StatusIcon size={11} strokeWidth={2.2} />
              {meta.label}
            </span>
            <span className="text-[10.5px] text-neutral-400 uppercase tracking-wider">
              {formatDate(lead.created_at)}
            </span>
          </div>
        </div>

        {/* ─ Actions ─ */}
        <div className="flex lg:flex-col items-start lg:items-end gap-2 lg:min-w-[160px]">
          {!isClosed ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={onDelivered}
                isLoading={busy}
                leftIcon={<CheckCircle2 size={14} strokeWidth={2} />}
                fullWidth
              >
                Marquer livré
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                disabled={busy}
                leftIcon={<XCircle size={14} strokeWidth={2} />}
                fullWidth
              >
                Annuler
              </Button>
            </>
          ) : (
            <div className="w-full text-right lg:text-right">
              <p className={['text-[12.5px] font-medium', meta.text].join(' ')}>
                {meta.label} ✓
              </p>
              <p className="text-[10.5px] text-neutral-400 mt-1">
                Aucune action requise
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
