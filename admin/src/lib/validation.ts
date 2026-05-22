export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateEmail(value: string): string | null {
  if (!value.trim()) return 'L\'adresse e-mail est requise.';
  if (!EMAIL_RE.test(value.trim())) return 'Format d\'e-mail invalide.';
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return 'Le mot de passe est requis.';
  if (value.length < 8) return 'Au moins 8 caractères.';
  return null;
}

export function validateStrongPassword(value: string): string | null {
  if (!value) return 'Le mot de passe est requis.';
  if (value.length < 8) return 'Au moins 8 caractères.';
  if (!/[A-Z]/.test(value)) return 'Au moins une majuscule.';
  if (!/[a-z]/.test(value)) return 'Au moins une minuscule.';
  if (!/\d/.test(value)) return 'Au moins un chiffre.';
  return null;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Très faible' | 'Faible' | 'Moyen' | 'Fort' | 'Excellent';
  hint?: string;
}

export function gaugePasswordStrength(value: string): PasswordStrength {
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;

  const labels: PasswordStrength['label'][] = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Excellent'];
  const hints = [
    'Mélangez lettres, chiffres et symboles.',
    'Ajoutez une majuscule et un chiffre.',
    'Allongez à 12+ caractères pour plus de sécurité.',
    'Bon mot de passe.',
    'Très sécurisé.',
  ];
  const clamped = Math.min(score, 4) as PasswordStrength['score'];
  return { score: clamped, label: labels[clamped], hint: hints[clamped] };
}
