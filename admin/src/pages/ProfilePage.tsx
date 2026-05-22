import { useState, type FormEvent } from 'react';
import { ShieldCheck, Save, KeyRound } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/ui/Button';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Alert } from '../components/ui/Alert';
import { changePassword, getStoredUser, AuthError } from '../lib/auth';
import { gaugePasswordStrength } from '../lib/validation';

export function ProfilePage() {
  const user = getStoredUser();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [nextError, setNextError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { score, label, hint } = gaugePasswordStrength(next);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCurrentError(null);
    setNextError(null);
    setConfirmError(null);
    setSuccess(null);

    if (!current) {
      setCurrentError('Mot de passe actuel requis.');
      return;
    }
    if (next.length < 8) {
      setNextError('8 caractères minimum.');
      return;
    }
    if (next !== confirm) {
      setConfirmError('Les mots de passe ne correspondent pas.');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(current, next);
      setSuccess('Mot de passe mis à jour. Toutes les autres sessions ont été déconnectées.');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.field === 'password') setCurrentError(err.message);
        else setNextError(err.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Mon compte"
        title={user?.name || 'Profil'}
        description={user?.email}
      />

      <section className="max-w-xl bg-cream-100 ring-1 ring-ink-900/8 rounded-2xl p-6 shadow-card">
        <div className="flex items-center gap-3 mb-5">
          <KeyRound size={18} strokeWidth={1.6} className="text-ink-400" />
          <h2 className="font-display text-[22px] text-ink-900">Changer le mot de passe</h2>
        </div>

        {success && (
          <div className="mb-5">
            <Alert tone="success" title="Mot de passe modifié">{success}</Alert>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <PasswordInput
            label="Mot de passe actuel"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            error={currentError}
            autoComplete="current-password"
            required
          />
          <div className="space-y-2">
            <PasswordInput
              label="Nouveau mot de passe"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              error={nextError}
              autoComplete="new-password"
              required
            />
            {next && (
              <div className="space-y-1">
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={[
                        'h-1 flex-1 rounded-full transition-colors',
                        i < score
                          ? score < 2 ? 'bg-error-500'
                            : score < 4 ? 'bg-warn-500'
                            : 'bg-success-500'
                          : 'bg-ink-900/8',
                      ].join(' ')}
                    />
                  ))}
                </div>
                <p className="text-[11.5px] text-ink-300">
                  <span className="text-ink-400 font-medium">{label}</span> · {hint}
                </p>
              </div>
            )}
          </div>
          <PasswordInput
            label="Confirmer le nouveau mot de passe"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={confirmError}
            autoComplete="new-password"
            required
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={submitting}
            leftIcon={<ShieldCheck size={16} strokeWidth={2} />}
            rightIcon={!submitting ? <Save size={16} strokeWidth={2} /> : undefined}
          >
            Mettre à jour
          </Button>
        </form>
      </section>
    </>
  );
}
