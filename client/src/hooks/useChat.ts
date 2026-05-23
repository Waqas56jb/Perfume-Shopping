/* ─────────────────────────────────────────────────────────────────────────
 *  useChat — hooks into the real backend.
 *
 *  UX rule: the welcome message renders STATICALLY (no API call) so the
 *  customer never waits on the very first screen. The agent only takes
 *  over from the customer's FIRST real message onwards.
 *
 *  When the customer sends that first real message, we also pass a
 *  `seededAssistantMessage` to the backend so the LLM knows the welcome
 *  was already shown and doesn't re-greet.
 * ───────────────────────────────────────────────────────────────────────── */

import { useCallback, useRef, useState } from 'react';
import type { ChatMessage, QuickReply } from '../types/chat';
import {
  sendChatMessage,
  getStoredSessionId,
  setStoredSessionId,
  clearStoredSessionId,
  ChatApiError,
} from '../lib/api';

let idCounter = 0;
const nextId = () => `msg-${Date.now()}-${++idCounter}`;

/* ─── Static welcome (no backend call, instant display) ───────────────── */
const STATIC_WELCOME = `Bienvenue chez Eleganza. ✨

Découvrez nos **Extraits de Parfum** (Haute Concentration : **25 % à 30 %**).

🎁 **OFFRE DE LANCEMENT : 3 achetés + 1 OFFERT**
🚚 **Livraison OFFERTE** sur ce pack (**59,70 € au lieu de 79,60 €**)`;

const STATIC_QUICK_REPLIES: QuickReply[] = [
  {
    id: 'welcome-qr-pack',
    label: '🛍️ Acheter le Pack 3+1 (Livraison Gratuite)',
    value: 'Je voudrais profiter du Pack 3+1 avec la livraison gratuite.',
  },
  {
    id: 'welcome-qr-inspiration',
    label: '🔍 Trouver mon inspiration',
    value: 'Aidez-moi à trouver mon inspiration olfactive.',
  },
  {
    id: 'welcome-qr-pourquoi',
    label: '💎 Pourquoi nos Extraits ?',
    value: 'Pourquoi vos Extraits sont-ils différents ?',
  },
];

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(getStoredSessionId());
  const abortRef = useRef<AbortController | null>(null);
  /* Tracks whether we still need to seed the backend with the static
     welcome on the next API call. We seed exactly once per session. */
  const needsSeedRef = useRef<boolean>(true);

  const pushMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: nextId(), timestamp: Date.now() },
    ]);
  }, []);

  /* Internal — performs the HTTP call and renders the bot's reply pieces. */
  const callBackend = useCallback(async (userText: string) => {
    setIsTyping(true);
    setError(null);

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    // On the first real turn, send the static welcome so the bot sees it
    // in its history and won't re-greet.
    const seed = needsSeedRef.current ? STATIC_WELCOME : undefined;

    try {
      const res = await sendChatMessage(
        userText,
        sessionIdRef.current,
        abortRef.current.signal,
        seed,
      );
      needsSeedRef.current = false;

      // Persist the session id so the next turn keeps context
      if (res.sessionId && res.sessionId !== sessionIdRef.current) {
        sessionIdRef.current = res.sessionId;
        setStoredSessionId(res.sessionId);
      }

      if (res.reply) {
        pushMessage({ sender: 'bot', kind: 'text', text: res.reply });
      }
      if (res.products && res.products.length > 0) {
        pushMessage({ sender: 'bot', kind: 'product-carousel', products: res.products });
      }
      if (res.quickReplies && res.quickReplies.length > 0) {
        pushMessage({
          sender: 'bot',
          kind: 'quick-replies',
          quickReplies: res.quickReplies.map((q, i) => ({
            id: `qr-${Date.now()}-${i}`,
            label: q.label,
            value: q.value,
          })),
        });
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      const msg = err instanceof ChatApiError
        ? "Notre conseillère est momentanément injoignable. Veuillez réessayer dans un instant."
        : "Un instant — la connexion semble interrompue. Vérifiez votre réseau puis renvoyez votre message.";
      pushMessage({ sender: 'bot', kind: 'text', text: msg });
      setError((err as Error).message);
    } finally {
      setIsTyping(false);
    }
  }, [pushMessage]);

  /* First contact — INSTANT static welcome. No backend call yet.
     The agent only kicks in once the customer types/taps something. */
  const startConversation = useCallback(() => {
    if (hasStarted) return;
    setHasStarted(true);
    pushMessage({ sender: 'bot', kind: 'text', text: STATIC_WELCOME });
    pushMessage({
      sender: 'bot',
      kind: 'quick-replies',
      quickReplies: STATIC_QUICK_REPLIES,
    });
  }, [hasStarted, pushMessage]);

  const sendUserMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    pushMessage({ sender: 'user', kind: 'text', text });
    await callBackend(text);
  }, [callBackend, pushMessage]);

  const sendQuickReply = useCallback(async (qr: QuickReply) => {
    await sendUserMessage(qr.value);
  }, [sendUserMessage]);

  const resetConversation = useCallback(() => {
    abortRef.current?.abort();
    clearStoredSessionId();
    sessionIdRef.current = null;
    needsSeedRef.current = true;
    setMessages([]);
    setHasStarted(false);
    setError(null);
    setIsTyping(false);
  }, []);

  return {
    messages,
    isTyping,
    hasStarted,
    error,
    startConversation,
    sendUserMessage,
    sendQuickReply,
    resetConversation,
  };
}
