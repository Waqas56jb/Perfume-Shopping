import { useEffect, useState, type FormEvent } from 'react';
import { Eye, EyeOff, Save, Key, Sliders, Cpu, RefreshCw } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { FullPageSpinner } from '../components/Spinner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { apiRequest } from '../lib/api';

interface SettingsResp {
  settings: Record<
    string,
    { value: string | null; hasValue: boolean; isSecret: boolean; description: string | null; updatedAt: string }
  >;
}

const MODEL_OPTIONS = [
  { value: '', label: 'Par défaut (gpt-4o-mini)' },
  { value: 'gpt-4o-mini', label: 'gpt-4o-mini · économique' },
  { value: 'gpt-4o', label: 'gpt-4o · qualité supérieure' },
  { value: 'gpt-4.1-mini', label: 'gpt-4.1-mini · récent, équilibré' },
];

export function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [data, setData] = useState<SettingsResp['settings'] | null>(null);

  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [temperature, setTemperature] = useState('');
  const [maxTokens, setMaxTokens] = useState('');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<SettingsResp>('/api/admin/settings');
      setData(res.settings);
      setApiKey('');
      setModel(res.settings.openai_model?.value || '');
      setTemperature(res.settings.openai_temperature?.value || '');
      setMaxTokens(res.settings.openai_max_tokens?.value || '');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    setSaving(true);
    try {
      const patch: Record<string, string | null> = {};
      if (apiKey.trim()) patch.openai_api_key = apiKey.trim();
      patch.openai_model = model || '';
      patch.openai_temperature = temperature || '';
      patch.openai_max_tokens = maxTokens || '';

      await apiRequest('/api/admin/settings', { method: 'PATCH', body: patch });
      setSuccess('Paramètres enregistrés. Le chatbot utilisera ces valeurs immédiatement.');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleClearKey = async () => {
    if (!confirm('Effacer la clé OpenAI ? Le serveur reviendra à la clé de l\'environnement (.env).')) return;
    setSaving(true);
    try {
      await apiRequest('/api/admin/settings', {
        method: 'PATCH',
        body: { openai_api_key: '' },
      });
      setSuccess('Clé effacée. Le serveur utilise désormais la clé .env (fallback).');
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FullPageSpinner label="Chargement des paramètres…" />;

  const keyDisplay = data?.openai_api_key;
  const keyIsAdminSet = keyDisplay?.hasValue;

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Paramètres"
        description="Clé OpenAI, modèle et tuning du moteur conversationnel. La clé saisie ici prend le pas sur celle du .env du serveur."
      />

      {error && (
        <div className="mb-5">
          <Alert tone="error" title="Erreur">{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mb-5">
          <Alert tone="success" title="Enregistré">{success}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6" noValidate>
        {/* OpenAI key card */}
        <section className="xl:col-span-2 bg-cream-100 ring-1 ring-ink-900/8 rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-1">
            <Key size={18} strokeWidth={1.6} className="text-ink-400" />
            <h2 className="font-display text-[22px] text-ink-900">Clé OpenAI</h2>
          </div>
          <p className="text-[12.5px] text-ink-300 mb-5">
            Saisissez votre clé personnelle pour facturer la consommation sur votre compte. Si vide,
            le serveur utilise la clé définie dans <span className="font-mono">OPENAI_API_KEY</span> du fichier <span className="font-mono">.env</span>.
          </p>

          <div className="mb-4 flex items-center justify-between px-4 py-3 bg-cream-50 ring-1 ring-ink-900/8 rounded-xl">
            <div className="min-w-0">
              <p className="text-[10.5px] uppercase tracking-elegant text-ink-300">Clé active</p>
              <p className="text-[13.5px] text-ink-900 font-mono mt-0.5">
                {keyIsAdminSet ? keyDisplay?.value : '— fallback .env —'}
              </p>
            </div>
            <span
              className={[
                'text-[10.5px] uppercase tracking-wider px-2.5 py-1 rounded-full',
                keyIsAdminSet ? 'bg-success-100 text-success-500' : 'bg-warn-100 text-warn-500',
              ].join(' ')}
            >
              {keyIsAdminSet ? 'Admin' : 'Environnement'}
            </span>
          </div>

          <div className="space-y-3">
            <Input
              label="Nouvelle clé OpenAI"
              type={showKey ? 'text' : 'password'}
              placeholder="sk-proj-……"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              leftIcon={<Key size={14} strokeWidth={1.8} />}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="text-ink-300 hover:text-ink-900 p-1"
                  aria-label={showKey ? 'Masquer' : 'Afficher'}
                >
                  {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
              hint="Format: sk-proj-… Disponible sur platform.openai.com → API Keys"
            />
            <div className="flex items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={saving}
                leftIcon={<Save size={15} strokeWidth={2} />}
              >
                Enregistrer
              </Button>
              {keyIsAdminSet && (
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={handleClearKey}
                  disabled={saving}
                  leftIcon={<RefreshCw size={14} strokeWidth={2} />}
                >
                  Revenir au .env
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Tuning card */}
        <section className="bg-cream-100 ring-1 ring-ink-900/8 rounded-2xl p-6 shadow-card">
          <div className="flex items-center gap-3 mb-1">
            <Sliders size={18} strokeWidth={1.6} className="text-ink-400" />
            <h2 className="font-display text-[22px] text-ink-900">Tuning</h2>
          </div>
          <p className="text-[12.5px] text-ink-300 mb-5">
            Affinez le comportement du modèle. Laissez vide pour utiliser les valeurs par défaut.
          </p>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-elegant text-ink-300 font-medium">
                Modèle
              </label>
              <div className="flex items-center gap-2 bg-cream-50 ring-1 ring-ink-900/10 rounded-xl h-11 px-3.5">
                <Cpu size={14} strokeWidth={1.8} className="text-ink-300" />
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="flex-1 bg-transparent text-[14px] text-ink-900 focus:outline-none cursor-pointer"
                >
                  {MODEL_OPTIONS.map((o) => (
                    <option key={o.value || 'default'} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Température"
              type="number"
              step="0.05"
              min="0"
              max="2"
              placeholder="0.55"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              hint="0 = déterministe · 1 = créatif · 2 = chaotique"
            />

            <Input
              label="Max tokens / réponse"
              type="number"
              min="100"
              max="4000"
              placeholder="600"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
              hint="Plafond de longueur de chaque réponse."
            />
          </div>
        </section>
      </form>
    </>
  );
}
