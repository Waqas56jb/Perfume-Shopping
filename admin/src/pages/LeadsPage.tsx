import { useEffect, useState } from 'react';
import { Download, Mail, Phone, UsersRound } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FullPageSpinner } from '../components/Spinner';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { apiRequest, apiDownload } from '../lib/api';
import { formatDate } from '../lib/format';

interface Lead {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  source: string;
  marketing_opt_in: boolean;
  notes: string | null;
  created_at: string;
}

export function LeadsPage() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    apiRequest<{ items: Lead[] }>('/api/admin/leads?limit=500')
      .then((res) => setItems(res.items))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async () => {
    setDownloading(true);
    try {
      await apiDownload('/api/admin/leads/export.csv', `eleganza-leads-${Date.now()}.csv`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Acquisition"
        title="Prospects capturés"
        description="Adresses e-mail recueillies par le conseiller IA, prêtes à enrichir votre liste de diffusion."
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

      {error && (
        <div className="mb-6">
          <Alert tone="error" title="Erreur">{error}</Alert>
        </div>
      )}

      {loading ? (
        <FullPageSpinner label="Chargement…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<UsersRound size={36} strokeWidth={1.4} />}
          title="Aucun prospect pour l'instant"
          description="Dès qu'un visiteur partage son adresse e-mail via le conseiller, elle apparaîtra ici."
        />
      ) : (
        <div className="bg-cream-100 ring-1 ring-ink-900/8 rounded-2xl overflow-hidden shadow-card">
          <table className="w-full text-[13.5px]">
            <thead className="bg-cream-200/50">
              <tr className="text-left text-[10.5px] uppercase tracking-elegant text-ink-300">
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Nom</th>
                <th className="px-5 py-3 font-medium">Téléphone</th>
                <th className="px-5 py-3 font-medium">Source</th>
                <th className="px-5 py-3 font-medium">Capturé le</th>
                <th className="px-5 py-3 font-medium text-center">Newsletter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-900/8">
              {items.map((l) => (
                <tr key={l.id} className="hover:bg-cream-200/40 transition-colors">
                  <td className="px-5 py-3 text-ink-900">
                    <div className="flex items-center gap-2">
                      <Mail size={13} strokeWidth={1.8} className="text-ink-300 flex-shrink-0" />
                      {l.email}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-400">{l.name || '—'}</td>
                  <td className="px-5 py-3 text-ink-400">
                    {l.phone ? (
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} strokeWidth={1.8} />
                        {l.phone}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-5 py-3 text-ink-400 capitalize">{l.source}</td>
                  <td className="px-5 py-3 text-ink-400">{formatDate(l.created_at)}</td>
                  <td className="px-5 py-3 text-center">
                    {l.marketing_opt_in ? (
                      <span className="inline-block w-2 h-2 rounded-full bg-success-500" />
                    ) : (
                      <span className="inline-block w-2 h-2 rounded-full bg-ink-100" />
                    )}
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
