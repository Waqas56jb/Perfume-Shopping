export function formatDate(iso: string | undefined | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function formatDay(iso: string | undefined | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
}

export function relativeTime(iso: string | undefined | null): string {
  if (!iso) return '—';
  const t = new Date(iso).getTime();
  const diff = Date.now() - t;
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `il y a ${hr} h`;
  const d = Math.floor(hr / 24);
  if (d < 30) return `il y a ${d} j`;
  return formatDate(iso);
}

export function compactNumber(n: number | undefined | null): string {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function thousands(n: number | undefined | null): string {
  if (n === null || n === undefined) return '—';
  return new Intl.NumberFormat('fr-FR').format(n);
}

export function maskApiKey(key: string | null | undefined): string {
  if (!key) return '—';
  if (key.length <= 12) return key;
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

export function truncate(text: string | null | undefined, max = 80): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max - 1) + '…' : text;
}
