import { useEffect, useState } from 'react';
import {
  MessagesSquare, UsersRound, TrendingUp, Coins, Boxes,
  ShieldAlert, Activity, Euro, AlertOctagon,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar,
} from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { FullPageSpinner } from '../components/Spinner';
import { Alert } from '../components/ui/Alert';
import { apiRequest } from '../lib/api';
import { compactNumber, thousands, formatDay, relativeTime } from '../lib/format';
import { getStoredUser } from '../lib/auth';

interface Overview {
  totalSessions: number; totalMessages: number; totalLeads: number;
  totalProducts: number; leadsFromSessions: number; escalations: number;
  totalTokens: number; avgMessages: number; conversionRate: number;
}
interface DailyRow { day: string; total_sessions: number; total_messages: number; leads_captured: number; escalations: number; total_tokens: number }
interface IntentRow { intent: string; count: number }
interface RedactionRow { id: string; session_id: string; redacted_terms: string[]; detected_forbidden: string | null; created_at: string; content: string }
type Period = 'today' | 'week' | 'month' | 'year';
interface PeriodStats {
  leadValueEur: number;
  visits: Record<Period, number>;
  leads: Record<Period, number>;
  revenue: Record<Period, number>;
  conversion: Record<Period, number>;
}

const PERIOD_LABEL: Record<Period, string> = {
  today: "Aujourd'hui",
  week: 'Cette semaine',
  month: 'Ce mois',
  year: 'Cette année',
};

export function DashboardPage() {
  const user = getStoredUser();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [intents, setIntents] = useState<IntentRow[]>([]);
  const [redactions, setRedactions] = useState<RedactionRow[]>([]);
  const [periods, setPeriods] = useState<PeriodStats | null>(null);
  const [activePeriod, setActivePeriod] = useState<Period>('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const [o, d, i, r, p] = await Promise.all([
          apiRequest<Overview>('/api/admin/stats/overview', { signal: ctrl.signal }),
          apiRequest<{ series: DailyRow[] }>('/api/admin/stats/daily?days=14', { signal: ctrl.signal }),
          apiRequest<{ intents: IntentRow[] }>('/api/admin/stats/intents', { signal: ctrl.signal }),
          apiRequest<{ events: RedactionRow[] }>('/api/admin/stats/redactions', { signal: ctrl.signal }),
          apiRequest<PeriodStats>('/api/admin/stats/periods', { signal: ctrl.signal }),
        ]);
        setOverview(o);
        setDaily(d.series);
        setIntents(i.intents);
        setRedactions(r.events);
        setPeriods(p);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  if (loading) return <FullPageSpinner label="Chargement du tableau de bord…" />;

  const fmtEur = (v: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);

  return (
    <>
      <PageHeader
        eyebrow="Console d'administration"
        title={`Bonjour, ${user?.name?.split(' ')[0] || 'Administrateur'}.`}
        description="Performance du conseiller IA, prospects capturés et estimation du chiffre d'affaires en temps réel."
      />

      {error && <div className="mb-6"><Alert tone="error" title="Données partielles">{error}</Alert></div>}

      {/* ─── Period tabs + KPI cards ─── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="font-display text-[22px] text-black tracking-tight">Performance</h2>
          <div className="inline-flex items-center gap-0.5 bg-white border border-neutral-300 rounded-lg p-1">
            {(['today', 'week', 'month', 'year'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={[
                  'px-3.5 py-1.5 rounded-md text-[12px] tracking-wider uppercase transition-colors',
                  activePeriod === p ? 'bg-black text-white' : 'text-neutral-500 hover:text-black',
                ].join(' ')}
              >
                {PERIOD_LABEL[p]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Visites du site"
            value={thousands(periods?.visits[activePeriod] ?? 0)}
            hint={`conversations ${PERIOD_LABEL[activePeriod].toLowerCase()}`}
            icon={<MessagesSquare size={18} strokeWidth={1.6} />}
          />
          <StatCard
            label="Prospects"
            value={thousands(periods?.leads[activePeriod] ?? 0)}
            hint={`${periods?.conversion[activePeriod] ?? 0}% de conversion`}
            icon={<UsersRound size={18} strokeWidth={1.6} />}
          />
          <RevenueCard
            label="CA estimé"
            value={fmtEur(periods?.revenue[activePeriod] ?? 0)}
            hint={`${periods?.leadValueEur ?? 40}€ par prospect (configurable)`}
            icon={<Euro size={18} strokeWidth={1.6} />}
          />
          <StatCard
            label="Conversion"
            value={`${periods?.conversion[activePeriod] ?? 0}%`}
            hint="Visites → prospects"
            icon={<TrendingUp size={18} strokeWidth={1.6} />}
          />
        </div>
      </section>

      {/* ─── Lifetime KPIs ─── */}
      <section className="mb-10">
        <h2 className="font-display text-[22px] text-black tracking-tight mb-4">Cumul depuis le lancement</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Conversations" value={thousands(overview?.totalSessions)} hint={`${overview?.avgMessages ?? 0} msg/conv`} icon={<MessagesSquare size={18} strokeWidth={1.6} />} />
          <StatCard label="Prospects capturés" value={thousands(overview?.totalLeads)} hint={`${overview?.conversionRate ?? 0}% de conversion`} icon={<UsersRound size={18} strokeWidth={1.6} />} />
          <StatCard label="Tokens consommés" value={compactNumber(overview?.totalTokens)} hint="OpenAI · cumul" icon={<Coins size={18} strokeWidth={1.6} />} />
          <StatCard label="Catalogue actif" value={thousands(overview?.totalProducts)} hint="parfums en base" icon={<Boxes size={18} strokeWidth={1.6} />} />
        </div>
      </section>

      {/* ─── Charts ─── */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-10">
        <div className="xl:col-span-2 bg-white border border-neutral-200 rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-elegant text-neutral-400 font-medium mb-1">Activité 14 jours</p>
              <h2 className="font-display text-[22px] text-black tracking-tight">Conversations & messages</h2>
            </div>
            <Activity size={18} strokeWidth={1.6} className="text-neutral-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="grad-sessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000000" stopOpacity={0.30} />
                    <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="grad-messages" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A96E" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#C9A96E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#000000" strokeOpacity={0.05} />
                <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 11, fill: '#7A7A7A' }} stroke="#000" strokeOpacity={0.1} />
                <YAxis tick={{ fontSize: 11, fill: '#7A7A7A' }} stroke="#000" strokeOpacity={0.1} />
                <Tooltip
                  contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                  labelFormatter={formatDay}
                />
                <Area type="monotone" dataKey="total_messages" stroke="#C9A96E" strokeWidth={2} fill="url(#grad-messages)" name="Messages" />
                <Area type="monotone" dataKey="total_sessions" stroke="#000000" strokeWidth={2} fill="url(#grad-sessions)" name="Conversations" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-elegant text-neutral-400 font-medium mb-1">Distribution</p>
              <h2 className="font-display text-[22px] text-black tracking-tight">Intentions du bot</h2>
            </div>
            <TrendingUp size={18} strokeWidth={1.6} className="text-neutral-400" />
          </div>
          {intents.length === 0 ? (
            <p className="text-[13px] text-neutral-500">Aucune donnée pour l'instant.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={intents} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.05} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#7A7A7A' }} stroke="#000" strokeOpacity={0.1} />
                  <YAxis type="category" dataKey="intent" tick={{ fontSize: 11, fill: '#3D3D3D' }} width={92} stroke="#000" strokeOpacity={0.1} />
                  <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 10, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#000000" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </section>

      {/* ─── Redactions & alerts ─── */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-elegant text-neutral-400 font-medium mb-1">Garde-fou</p>
              <h2 className="font-display text-[22px] text-black tracking-tight">Redactions récentes</h2>
            </div>
            <ShieldAlert size={18} strokeWidth={1.6} className="text-neutral-400" />
          </div>
          {redactions.length === 0 ? (
            <p className="text-[13px] text-neutral-500">Aucune redaction — l'agent respecte la règle absolue. ✨</p>
          ) : (
            <ul className="space-y-3">
              {redactions.slice(0, 6).map((r) => (
                <li key={r.id} className="flex gap-3 items-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-error-500 mt-2 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12.5px] text-neutral-600 line-clamp-2 leading-snug">{r.content.slice(0, 140)}</p>
                    <p className="text-[11px] text-neutral-400 mt-1 flex gap-2 flex-wrap">
                      {r.detected_forbidden && <span className="font-mono">{r.detected_forbidden}</span>}
                      <span>· {relativeTime(r.created_at)}</span>
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-elegant text-neutral-400 font-medium mb-1">Suivi opérationnel</p>
              <h2 className="font-display text-[22px] text-black tracking-tight">Indicateurs clés</h2>
            </div>
            <AlertOctagon size={18} strokeWidth={1.6} className="text-neutral-400" />
          </div>
          <ul className="space-y-3 text-[13.5px]">
            <KV label="Sessions avec lead capturé" value={thousands(overview?.leadsFromSessions)} />
            <KV label="Escalades vers un humain" value={thousands(overview?.escalations)} />
            <KV label="Taux de conversion (cumul)" value={`${overview?.conversionRate}%`} />
            <KV label="Messages totaux" value={thousands(overview?.totalMessages)} />
            <KV label="Tokens consommés" value={compactNumber(overview?.totalTokens)} />
          </ul>
        </div>
      </section>
    </>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-neutral-500">{label}</span>
      <span className="text-black font-medium">{value}</span>
    </li>
  );
}

/* Revenue card — same white background as other KPIs, gold accents on label + value */
function RevenueCard({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon?: React.ReactNode }) {
  return (
    <article className="group bg-white border border-neutral-200 rounded-xl p-5 lg:p-6 hover:border-gold-300 hover:shadow-card transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10.5px] uppercase tracking-elegant text-neutral-400 font-medium">{label}</span>
        {icon && <div className="text-gold-500 group-hover:text-gold-600 transition-colors">{icon}</div>}
      </div>
      <p className="font-display text-[32px] lg:text-[40px] text-gold-600 leading-none tracking-tight">{value}</p>
      <div className="mt-3 flex items-center justify-between gap-3 min-h-[18px]">
        {hint && <p className="text-[12px] text-neutral-500 leading-snug">{hint}</p>}
      </div>
    </article>
  );
}
