import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, AlertOctagon, UserCheck, ChevronRight, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FullPageSpinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { Alert } from '../components/ui/Alert';
import { apiRequest } from '../lib/api';
import { relativeTime, truncate } from '../lib/format';

interface ConversationRow {
  session_id: string;
  created_at: string;
  last_active_at: string;
  language: string;
  message_count: number;
  lead_captured: boolean;
  escalated: boolean;
  customer_email: string | null;
  first_user_message: string | null;
  last_message: string | null;
}

export function ConversationsPage() {
  const [items, setItems] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    apiRequest<{ items: ConversationRow[] }>('/api/admin/conversations?limit=100')
      .then((res) => setItems(res.items))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = query
    ? items.filter(
        (i) =>
          (i.first_user_message || '').toLowerCase().includes(query.toLowerCase()) ||
          (i.last_message || '').toLowerCase().includes(query.toLowerCase()) ||
          (i.customer_email || '').toLowerCase().includes(query.toLowerCase()) ||
          i.session_id.includes(query)
      )
    : items;

  return (
    <>
      <PageHeader
        eyebrow="Données opérationnelles"
        title="Conversations"
        description="Chaque échange entre un visiteur et le conseiller IA, avec ses messages utilisateur + assistant."
      />

      {error && (
        <div className="mb-6">
          <Alert tone="error" title="Impossible de charger les conversations">
            {error}
          </Alert>
        </div>
      )}

      <div className="mb-5 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-cream-100 ring-1 ring-ink-900/8 rounded-full px-4 h-10 flex-1 max-w-md focus-within:ring-ink-900/30 transition-colors">
          <Search size={15} className="text-ink-300" strokeWidth={1.8} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par message, email, ou ID…"
            className="flex-1 bg-transparent text-[13.5px] text-ink-900 placeholder:text-ink-200 focus:outline-none"
          />
        </div>
        <span className="text-[12px] text-ink-300">
          {filtered.length} / {items.length}
        </span>
      </div>

      {loading ? (
        <FullPageSpinner label="Chargement…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<MessageSquare size={36} strokeWidth={1.4} />}
          title="Aucune conversation pour l'instant"
          description="Dès que le chatbot recevra un premier message, il apparaîtra ici."
        />
      ) : (
        <div className="bg-cream-100 ring-1 ring-ink-900/8 rounded-2xl overflow-hidden shadow-card">
          <ul className="divide-y divide-ink-900/8">
            {filtered.map((row) => (
              <li key={row.session_id}>
                <Link
                  to={`/conversations/${row.session_id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-cream-200/50 transition-colors group"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cream-50 ring-1 ring-ink-900/8 flex items-center justify-center">
                    <MessageSquare size={15} strokeWidth={1.7} className="text-ink-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10.5px] text-ink-300 uppercase">
                        {row.session_id.slice(0, 8)}
                      </span>
                      {row.lead_captured && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-success-500 bg-success-100 px-2 py-0.5 rounded-full">
                          <UserCheck size={10} strokeWidth={2} /> Lead
                        </span>
                      )}
                      {row.escalated && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-error-500 bg-error-100 px-2 py-0.5 rounded-full">
                          <AlertOctagon size={10} strokeWidth={2} /> Escalade
                        </span>
                      )}
                      <span className="text-[11px] text-ink-300">
                        · {row.language.toUpperCase()} · {row.message_count} msg
                      </span>
                    </div>
                    <p className="text-[13.5px] text-ink-900 leading-snug mt-1">
                      {truncate(row.first_user_message || row.last_message || '(conversation vide)', 120)}
                    </p>
                    <p className="text-[11.5px] text-ink-300 mt-0.5">
                      {row.customer_email ? `${row.customer_email} · ` : ''}
                      {relativeTime(row.last_active_at)}
                    </p>
                  </div>

                  <ChevronRight size={16} strokeWidth={1.7} className="text-ink-200 group-hover:text-ink-900 transition-colors" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
