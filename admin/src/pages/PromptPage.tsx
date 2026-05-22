import { useEffect, useState } from 'react';
import { FileText, Save, Play, Pause, Trash2, History, FilePlus } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FullPageSpinner } from '../components/Spinner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { apiRequest } from '../lib/api';
import { formatDate } from '../lib/format';

interface PromptRow {
  id: string;
  version: string;
  content: string;
  appendix: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

export function PromptPage() {
  const [list, setList] = useState<PromptRow[]>([]);
  const [active, setActive] = useState<PromptRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [version, setVersion] = useState('');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [l, a, eff] = await Promise.all([
        apiRequest<{ items: PromptRow[] }>('/api/admin/prompts'),
        apiRequest<{ prompt: PromptRow | null }>('/api/admin/prompts/active'),
        apiRequest<{ source: 'db' | 'file'; version: string; content: string; appendix: string | null }>(
          '/api/admin/prompts/effective'
        ),
      ]);
      setList(l.items);
      setActive(a.prompt);
      // Load the EFFECTIVE prompt (DB if active, else file) so the admin
      // always sees what the bot is actually using right now.
      setContent(eff.content);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveDraft = async (activate = false) => {
    if (!version.trim()) return setError('Veuillez fournir un numéro de version (ex. v1.1).');
    if (!content.trim() || content.length < 200) return setError('Le contenu du prompt semble trop court.');

    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await apiRequest('/api/admin/prompts', {
        method: 'POST',
        body: { version, content, notes, activate },
      });
      setSuccess(activate ? `Version ${version} créée et activée.` : `Version ${version} enregistrée.`);
      setVersion('');
      setNotes('');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleActivate = async (id: string) => {
    setBusy(true);
    try {
      await apiRequest(`/api/admin/prompts/${id}/activate`, { method: 'POST' });
      setSuccess('Prompt activé. Le chatbot utilisera cette version pour toutes les nouvelles conversations.');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setBusy(true);
    try {
      await apiRequest(`/api/admin/prompts/${id}/deactivate`, { method: 'POST' });
      setSuccess('Prompt désactivé. Le chatbot retombe sur le fichier prompts/system.md.');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string, ver: string) => {
    if (!confirm(`Supprimer définitivement la version ${ver} ?`)) return;
    setBusy(true);
    try {
      await apiRequest(`/api/admin/prompts/${id}`, { method: 'DELETE' });
      setSuccess(`Version ${ver} supprimée.`);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <FullPageSpinner label="Chargement du prompt…" />;

  return (
    <>
      <PageHeader
        eyebrow="Ingénierie de prompt"
        title="Entraînement du conseiller"
        description="Éditez le prompt système qui pilote le ton, la stratégie de vente et la règle « ne jamais citer la marque »."
      />

      {error && (
        <div className="mb-5">
          <Alert tone="error" title="Erreur">{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mb-5">
          <Alert tone="success" title="Succès">{success}</Alert>
        </div>
      )}

      <div className="mb-6 px-5 py-4 rounded-2xl bg-cream-100 ring-1 ring-ink-900/8 flex items-center gap-3">
        <div className={[
          'w-2 h-2 rounded-full',
          active ? 'bg-success-500 animate-pulse' : 'bg-warn-500',
        ].join(' ')} />
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-ink-300">Source actuellement utilisée par le chatbot</p>
          <p className="text-[14px] text-ink-900 font-medium">
            {active ? `DB · ${active.version}` : 'Fichier · prompts/system.md'}
          </p>
        </div>
        {active && (
          <span className="text-[11px] text-ink-300">activé {formatDate(active.created_at)}</span>
        )}
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Editor */}
        <div className="xl:col-span-2 bg-cream-100 ring-1 ring-ink-900/8 rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <FileText size={18} strokeWidth={1.6} className="text-ink-400" />
            <h2 className="font-display text-[22px] text-ink-900">Nouvelle version</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Numéro de version"
              placeholder="v1.1, v1.1-A, expérience-floraux…"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-elegant text-ink-300 font-medium">
                Contenu du prompt (markdown)
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={22}
                spellCheck={false}
                className="
                  w-full font-mono text-[12.5px] leading-relaxed
                  bg-cream-50 ring-1 ring-ink-900/10 rounded-xl
                  p-4 focus:outline-none focus:ring-ink-900/40 transition-shadow
                  resize-y scrollbar-elegant text-ink-900
                "
              />
              <p className="text-[11px] text-ink-300">
                {content.length.toLocaleString('fr-FR')} caractères · ≈ {Math.round(content.length / 4).toLocaleString('fr-FR')} tokens
              </p>
            </div>

            <Input
              label="Notes (interne, optionnel)"
              placeholder="Pourquoi cette version ?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex items-center gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => handleSaveDraft(false)}
                isLoading={busy}
                leftIcon={<Save size={15} strokeWidth={2} />}
              >
                Enregistrer (brouillon)
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => handleSaveDraft(true)}
                isLoading={busy}
                leftIcon={<FilePlus size={15} strokeWidth={2} />}
              >
                Enregistrer & activer
              </Button>
            </div>
          </div>
        </div>

        {/* Version history */}
        <div className="bg-cream-100 ring-1 ring-ink-900/8 rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <History size={18} strokeWidth={1.6} className="text-ink-400" />
            <h2 className="font-display text-[22px] text-ink-900">Historique</h2>
          </div>

          {list.length === 0 ? (
            <p className="text-[13px] text-ink-300">Aucune version enregistrée — le chatbot utilise actuellement le fichier <span className="font-mono">prompts/system.md</span>.</p>
          ) : (
            <ul className="space-y-3">
              {list.map((p) => (
                <li key={p.id} className="bg-cream-50 ring-1 ring-ink-900/8 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-[12.5px] text-ink-900">{p.version}</span>
                    {p.is_active ? (
                      <span className="text-[10px] uppercase tracking-wider bg-success-100 text-success-500 px-2 py-0.5 rounded-full">
                        Actif
                      </span>
                    ) : null}
                  </div>
                  <p className="text-[11px] text-ink-300 mb-2">{formatDate(p.created_at)}</p>
                  {p.notes && <p className="text-[11.5px] text-ink-400 italic line-clamp-2 mb-2">{p.notes}</p>}
                  <div className="flex items-center gap-1">
                    {p.is_active ? (
                      <button
                        type="button"
                        onClick={() => handleDeactivate(p.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1 text-[11px] text-ink-400 hover:text-ink-900 px-2 py-1 rounded-md hover:bg-ink-900/5 transition-colors"
                      >
                        <Pause size={11} /> Désactiver
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleActivate(p.id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1 text-[11px] text-ink-400 hover:text-ink-900 px-2 py-1 rounded-md hover:bg-ink-900/5 transition-colors"
                      >
                        <Play size={11} /> Activer
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setContent(p.content);
                        setVersion(`${p.version}-edit`);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] text-ink-400 hover:text-ink-900 px-2 py-1 rounded-md hover:bg-ink-900/5 transition-colors"
                    >
                      Charger
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, p.version)}
                      disabled={busy}
                      className="inline-flex items-center gap-1 text-[11px] text-error-500 hover:text-error-500 px-2 py-1 rounded-md hover:bg-error-100/60 transition-colors ml-auto"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
