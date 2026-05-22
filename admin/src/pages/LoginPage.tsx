import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { login, AuthError } from '../lib/auth';
import { validateEmail, validatePassword } from '../lib/validation';
import type { FormErrors, LoginRequest } from '../types/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const redirectTo = location.state?.from || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<FormErrors<LoginRequest>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    const fieldErrors: FormErrors<LoginRequest> = {};
    const emailErr = validateEmail(email);
    if (emailErr) fieldErrors.email = emailErr;
    const passErr = validatePassword(password);
    if (passErr) fieldErrors.password = passErr;
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login({ email, password, remember });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof AuthError) {
        if (err.field && err.field !== 'global' && err.field !== 'token') {
          setErrors({ [err.field]: err.message });
        } else {
          setGlobalError(err.message);
        }
      } else {
        setGlobalError('Une erreur est survenue. Veuillez réessayer.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Bon retour."
      subtitle="Connectez-vous pour accéder à la console d'administration Eleganza."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {globalError && (
          <Alert tone="error" title="Connexion impossible">
            {globalError}
          </Alert>
        )}

        <Input
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="prenom@eleganza-parfums.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<Mail size={15} strokeWidth={1.8} />}
          required
        />

        <div className="space-y-2">
          <PasswordInput
            label="Mot de passe"
            placeholder="Au moins 8 caractères"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
            required
          />
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="
                  h-4 w-4 rounded border-ink-900/20 text-ink-900 bg-cream-50
                  focus:ring-2 focus:ring-ink-900/40 focus:ring-offset-0
                  cursor-pointer accent-ink-900
                "
              />
              <span className="text-[12.5px] text-ink-400">Rester connecté(e) 30 jours</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-[12.5px] text-ink-400 hover:text-ink-900 transition-colors underline-offset-4 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          rightIcon={<ArrowRight size={16} strokeWidth={2} />}
        >
          {isSubmitting ? 'Connexion…' : 'Se connecter'}
        </Button>

        <div className="pt-2 text-center">
          <p className="text-[11.5px] text-ink-300">
            Accès réservé aux administrateurs autorisés.
            <br />
            Pour obtenir un accès, contactez{' '}
            <a
              href="mailto:eleganza.parfums@gmail.com"
              className="text-ink-900 underline-offset-4 hover:underline"
            >
              eleganza.parfums@gmail.com
            </a>
            .
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
