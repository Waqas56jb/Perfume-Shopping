import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, LogIn } from 'lucide-react';
import { AuthLayout } from '../components/AuthLayout';
import { Button } from '../components/ui/Button';

const COUNTDOWN_SECONDS = 5;

export function ResetSuccessPage() {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (seconds <= 0) {
      navigate('/login', { replace: true });
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, navigate]);

  return (
    <AuthLayout title="Mot de passe mis à jour." subtitle="Votre nouveau mot de passe est désormais actif.">
      <div className="space-y-6">
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mb-4">
            <CheckCircle2 size={32} strokeWidth={1.6} className="text-success-500" />
          </div>
          <p className="text-[14px] text-ink-400 max-w-sm leading-relaxed">
            Vous pouvez maintenant vous connecter avec votre nouveau mot de passe. Redirection
            automatique dans <span className="font-medium text-ink-900">{seconds}s</span>.
          </p>
        </div>

        <Link to="/login" className="block">
          <Button variant="primary" size="lg" fullWidth leftIcon={<LogIn size={16} strokeWidth={2} />} type="button">
            Aller à la connexion
          </Button>
        </Link>
      </div>
    </AuthLayout>
  );
}
