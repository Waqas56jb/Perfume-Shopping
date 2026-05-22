import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertOctagon, UserCheck, ShieldAlert, Sparkles, Tag } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FullPageSpinner } from '../components/Spinner';
import { Alert } from '../components/ui/Alert';
import { apiRequest } from '../lib/api';
import { formatDate, relativeTime } from '../lib/format';

interface Session {
  id: string;
  language: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  message_count: number;
  lead_captured: boolean;
  escalated: boolean;
  escalation_reason: string | null;
  total_tokens: number;
  created_at: string;
  last_active_at: string;
  closed_at: string | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  intent: string | null;
  suggested_product_ids: string[];
  quick_replies: { label: string; value: string }[] | null;
  detected_forbidden: string | null;
  redacted_terms: string[];
  routed_product_id: string | null;
  capture_lead: boolean;
  escalate_to_human: boolean;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  model: string | null;
  latency_ms: number | null;
  created_at: string;
}

export function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    apiRequest<{ session: Session; messages: Message[] }>(`/api/admin/conversations/${id}`)
      .then((res) => {
        setSession(res.session);
        setMessages(res.messages);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <FullPageSpinner label="Chargement…" />;
  if (error) return <Alert tone="error" title="Erreur">{error}</Alert>;
  if (!session) return <Alert tone="warn">Conversation introuvable.</Alert>;

  return (
    <>
      <Link
        to="/conversations"
        className="inline-flex items-center gap-2 text-[12px] text-ink-300 hover:text-ink-900 mb-4 transition-colors"
      >
        <ArrowLeft size={14} strokeWidth={2} />
        Retour aux conversations
      </Link>

      <PageHeader
        eyebrow={`Conversation · ${session.language.toUpperCase()}`}
        title={`Session ${session.id.slice(0, 8)}…`}
        description={`Démarrée ${formatDate(session.created_at)} · ${session.message_count} messages · ${session.total_tokens} tokens`}
      />

      {/* Metadata strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Meta label="Visiteur" value={session.customer_email || session.customer_name || 'Anonyme'} />
        <Meta label="Dernière activité" value={relativeTime(session.last_active_at)} />
        <Meta
          label="Statut"
          value={
            <span className="inline-flex items-center gap-1">
              {session.lead_captured ? (
                <><UserCheck size={13} strokeWidth={2} className="text-success-500" /> Lead</>
              ) : session.escalated ? (
                <><AlertOctagon size={13} strokeWidth={2} className="text-error-500" /> Escalade</>
              ) : (
                <>En cours</>
              )}
            </span>
          }
        />
        <Meta label="User-Agent" value={(session.user_agent || '—').slice(0, 28) + (session.user_agent && session.user_agent.length > 28 ? '…' : '')} />
      </section>

      {/* Messages */}
      <section className="bg-cream-100 ring-1 ring-ink-900/8 rounded-2xl p-5 lg:p-6 shadow-card">
        {messages.length === 0 ? (
          <p className="text-[13px] text-ink-300">Aucun message enregistré pour cette session.</p>
        ) : (
          <ul className="space-y-4">
            {messages.map((m) => (
              <li
                key={m.id}
                className={[
                  'flex',
                  m.role === 'user' ? 'justify-end' : 'justify-start',
                ].join(' ')}
              >
                <div className="max-w-[78%]">
                  <div
                    className={[
                      'rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-card whitespace-pre-wrap',
                      m.role === 'user'
                        ? 'bg-ink-900 text-cream-100 rounded-br-md'
                        : 'bg-cream-50 text-ink-900 rounded-bl-md',
                    ].join(' ')}
                  >
                    {m.content}
                  </div>
                  <div className="flex items-center flex-wrap gap-2 mt-1.5 px-1">
                    <span className="text-[10.5px] text-ink-300">{formatDate(m.created_at)}</span>
                    {m.intent && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-ink-300">
                        <Tag size={9} strokeWidth={2} /> {m.intent}
                      </span>
                    )}
                    {m.suggested_product_ids?.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-ink-300">
                        <Sparkles size={9} strokeWidth={2} />
                        {m.suggested_product_ids.join(', ')}
                      </span>
                    )}
                    {m.redacted_terms?.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-error-500 bg-error-100 px-1.5 py-0.5 rounded-full">
                        <ShieldAlert size={9} strokeWidth={2} /> redacté: {m.redacted_terms.join(', ')}
                      </span>
                    )}
                    {m.detected_forbidden && m.role === 'user' && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-warn-500 bg-warn-100 px-1.5 py-0.5 rounded-full">
                        détecté: {m.detected_forbidden}
                      </span>
                    )}
                    {m.total_tokens && (
                      <span className="text-[10px] text-ink-300 font-mono">
                        {m.total_tokens}t · {m.latency_ms || 0}ms
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-cream-100 ring-1 ring-ink-900/8 rounded-xl px-4 py-3">
      <p className="text-[10.5px] uppercase tracking-elegant text-ink-300 mb-1">{label}</p>
      <p className="text-[13px] text-ink-900 truncate">{value}</p>
    </div>
  );
}
