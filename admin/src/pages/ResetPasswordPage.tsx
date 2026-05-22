import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { resetPassword, AuthError } from '../lib/auth';
import { validateStrongPassword, gaugePasswordStrength } from '../lib/validation';

function StrengthMeter({ value }: { value: string }) {
  const { score, label, hint } = gaugePasswordStrength(value);
  const segments = [0, 1, 2, 3];
  const colors = [
    'bg-error-500',
    'bg-warn-500',
    'bg-warn-500',
    'bg-success-500',
    'bg-success-500',
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {segments.map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              value && i < score ? colors[score] : 'bg-ink-900/8'
            }`}
          />
        ))}
      </div>
      {value && (
        <div className="flex items-center justify-between text-[11.5px]">
          <span className="text-ink-400 font-medium">{label}</span>
          <span className="text-ink-300">{hint}</span>
        </div>
      )}
    </div>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tokenInvalid = !token || token.length < 6;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setPasswordError(null);
    setConfirmError(null);

    const passErr = validateStrongPassword(password);
    if (passErr) {
      setPasswordError(passErr);
      return;
    }
    if (confirm !== password) {
      setConfirmError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({ token, password });
      navigate('/reset-success', { replace: true });
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.field === 'password') setPasswordError(err.message);
        else setGlobalError(err.message);
      } else {
        setGlobalError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenInvalid) {
    return (
      <AuthLayout
        title="Lien invalide ou expiré."
        subtitle="Ce lien de réinitialisation n'est plus valable. Demandez-en un nouveau pour continuer."
      >
        <div className="space-y-5">
          <Alert tone="error" title="Lien expiré">
            Les liens de réinitialisation sont valables 30 minutes pour des raisons de sécurité.
            Veuillez recommencer la procédure.
          </Alert>
          <Link to="/forgot-password" className="block">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              leftIcon={<AlertCircle size={16} strokeWidth={2} />}
              type="button"
            >
              Demander un nouveau lien
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Définir un nouveau mot de passe."
      subtitle="Choisissez un mot de passe robuste : 8 caractères minimum, avec majuscules, minuscules et chiffres."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {globalError && (
          <Alert tone="error" title="Réinitialisation impossible">
            {globalError}
          </Alert>
        )}

        <div className="space-y-3">
          <PasswordInput
            label="Nouveau mot de passe"
            placeholder="Au moins 8 caractères"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            autoComplete="new-password"
            required
            autoFocus
          />
          <StrengthMeter value={password} />
        </div>

        <PasswordInput
          label="Confirmer le mot de passe"
          placeholder="Re-saisissez le mot de passe"
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
          isLoading={isSubmitting}
          leftIcon={<ShieldCheck size={16} strokeWidth={2} />}
          rightIcon={!isSubmitting ? <ArrowRight size={16} strokeWidth={2} /> : undefined}
        >
          {isSubmitting ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
        </Button>

        <p className="text-[11.5px] text-ink-300 text-center leading-relaxed">
          Une fois validé, vous serez déconnecté(e) de toutes les sessions actives, sauf celle-ci.
        </p>
      </form>
    </AuthLayout>
  );
}
