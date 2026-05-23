import { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, ImageOff } from 'lucide-react';
import { apiRequest, apiUploadFile, ApiError } from '../lib/api';

interface PhotoUploaderProps {
  /** product slug — if null/empty (new product, not yet saved), the uploader
   *  is disabled and shows a hint to save first. */
  slug?: string | null;
  /** Current image URLs (max 4). */
  urls: string[];
  /** Called with the latest array after upload/delete. */
  onChange: (next: string[]) => void;
  /** Max photos (default 4). */
  max?: number;
}

/**
 * 4-slot photo uploader for a product.
 * - Each slot either renders a preview (with a delete button) or a "+" upload tile.
 * - Disabled until the product is saved (a slug exists).
 */
export function PhotoUploader({ slug, urls, onChange, max = 4 }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const slots = Array.from({ length: max }, (_, i) => urls[i] || null);
  const enabled = Boolean(slug);

  const handlePick = (slotIndex: number) => {
    if (!enabled || uploadingIndex !== null) return;
    setUploadingIndex(slotIndex);
    inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // reset so picking the same file again still triggers change
    if (!file || !slug) { setUploadingIndex(null); return; }
    setError(null);
    try {
      const { product } = await apiUploadFile<{ product: { image_urls: string[] } }>(
        `/api/admin/products/${slug}/photos`,
        file,
      );
      onChange(product.image_urls || []);
    } catch (err) {
      const e = err instanceof ApiError ? err : null;
      setError(e?.message || (err as Error).message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleDelete = async (index: number) => {
    if (!enabled) return;
    if (!confirm('Supprimer cette photo ?')) return;
    setDeletingIndex(index);
    setError(null);
    try {
      const { product } = await apiRequest<{ product: { image_urls: string[] } }>(
        `/api/admin/products/${slug}/photos/${index}`,
        { method: 'DELETE' },
      );
      onChange(product.image_urls || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] uppercase tracking-elegant text-neutral-500 font-medium">
          Photos du flacon
        </label>
        <span className="text-[11px] text-neutral-400">{urls.length} / {max}</span>
      </div>

      {!enabled && (
        <p className="text-[11.5px] text-neutral-400 italic">
          Enregistrez d'abord le parfum pour pouvoir téléverser ses photos.
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={handleFile}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {slots.map((url, idx) => {
          const isUploading = uploadingIndex === idx;
          const isDeleting = deletingIndex === idx;

          if (url) {
            return (
              <div
                key={idx}
                className="group relative aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 hover:border-neutral-400 transition-colors"
              >
                <img
                  src={url}
                  alt={`Flacon ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  disabled={isDeleting || !enabled}
                  aria-label="Supprimer cette photo"
                  className="absolute top-2 right-2 w-8 h-8 rounded-md bg-black/70 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:bg-black/90 disabled:opacity-100 disabled:bg-black/60 transition-opacity flex items-center justify-center"
                >
                  {isDeleting ? (
                    <Loader2 size={13} strokeWidth={2.2} className="animate-spin" />
                  ) : (
                    <Trash2 size={13} strokeWidth={2.2} />
                  )}
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-2 left-2 text-[9.5px] uppercase tracking-wider bg-gold-400 text-black font-medium px-1.5 py-0.5 rounded">
                    Principale
                  </span>
                )}
              </div>
            );
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handlePick(idx)}
              disabled={!enabled || uploadingIndex !== null}
              className="
                group aspect-square rounded-lg border-2 border-dashed
                border-neutral-300 hover:border-neutral-900
                disabled:opacity-50 disabled:cursor-not-allowed
                flex flex-col items-center justify-center gap-1.5
                text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50
                transition-colors
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2
              "
            >
              {isUploading ? (
                <>
                  <Loader2 size={20} strokeWidth={1.6} className="animate-spin text-neutral-500" />
                  <span className="text-[10.5px] uppercase tracking-wider">Envoi…</span>
                </>
              ) : enabled ? (
                <>
                  <ImagePlus size={20} strokeWidth={1.4} />
                  <span className="text-[10.5px] uppercase tracking-wider">Ajouter</span>
                </>
              ) : (
                <>
                  <ImageOff size={20} strokeWidth={1.4} />
                  <span className="text-[10.5px] uppercase tracking-wider">Bientôt</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-[12px] text-error-500 leading-snug">{error}</p>
      )}
      <p className="text-[10.5px] text-neutral-400 leading-snug">
        JPG / PNG / WEBP / AVIF · 5 MB max par photo · maximum {max} photos. Si aucune photo n'est ajoutée, le chatbot affiche l'illustration de flacon par défaut.
      </p>
    </div>
  );
}
