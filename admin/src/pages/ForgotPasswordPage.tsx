import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { requestPasswordReset } from '../lib/auth';
import { validateEmail } from '../lib/validation';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [delivered, setDelivered] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    setError(null);

    setIsSubmitting(true);
    try {
      await requestPasswordReset({ email });
      setDelivered(email);
    } catch {
      setGlobalError('Une erreur est survenue. Veuillez réessayer dans un instant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (delivered) {
    return (
      <AuthLayout
        title="Vérifiez votre boîte de réception."
        subtitle="Si un compte est associé à cette adresse, vous recevrez un lien de réinitialisation dans les prochaines minutes."
      >
        <div className="space-y-5">
          <Alert tone="success" title="Demande envoyée">
            Un e-mail a été envoyé à <span className="font-medium">{delivered}</span> avec les
            instructions pour réinitialiser votre mot de passe. Le lien expire dans 30 minutes.
          </Alert>

          <div className="rounded-xl bg-cream-100 ring-1 ring-ink-900/8 p-4 space-y-2">
            <p className="text-[12px] text-ink-400 flex items-start gap-2">
              <CheckCircle2 size={14} strokeWidth={1.8} className="flex-shrink-0 mt-0.5 text-ink-300" />
              <span>Pensez à vérifier votre dossier « spam » ou « courrier indésirable ».</span>
            </p>
            <p className="text-[12px] text-ink-400 flex items-start gap-2">
              <CheckCircle2 size={14} strokeWidth={1.8} className="flex-shrink-0 mt-0.5 text-ink-300" />
              <span>
                Aucun e-mail après 5 minutes ? Vérifiez l'adresse saisie ou{' '}
                <button
                  type="button"
                  onClick={() => {
                    setDelivered(null);
                    setEmail('');
                  }}
                  className="text-ink-900 underline-offset-4 hover:underline"
                >
                  réessayez
                </button>
                .
              </span>
            </p>
          </div>

          <Link to="/login" className="block">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              leftIcon={<ArrowLeft size={16} strokeWidth={2} />}
              type="button"
            >
              Retour à la connexion
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Mot de passe oublié ?"
      subtitle="Saisissez votre adresse e-mail. Nous vous enverrons un lien sécurisé pour définir un nouveau mot de passe."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {globalError && (
          <Alert tone="error" title="Impossible d'envoyer le lien">
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
          error={error}
          leftIcon={<Mail size={15} strokeWidth={1.8} />}
          required
          autoFocus
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
          rightIcon={<Send size={15} strokeWidth={2} />}
        >
          {isSubmitting ? 'Envoi en cours…' : 'Envoyer le lien'}
        </Button>

        <Link
          to="/login"
          className="
            inline-flex items-center gap-2 text-[12.5px] text-ink-400 hover:text-ink-900
            transition-colors underline-offset-4 hover:underline
          "
        >
          <ArrowLeft size={14} strokeWidth={2} />
          Retour à la connexion
        </Link>
      </form>
    </AuthLayout>
  );
}
