/* ─────────────────────────────────────────────────────────────────────────
 *  useChat — hooks into the real backend.
 *  Each turn POSTs /api/chat and renders the LLM response (reply text,
 *  product carousel, quick-reply chips). No scripted fallbacks here —
 *  the agent in server/prompts/system.md drives every word.
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

const WELCOME_TRIGGER = 'Bonjour';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionIdRef = useRef<string | null>(getStoredSessionId());
  const abortRef = useRef<AbortController | null>(null);

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

    try {
      const res = await sendChatMessage(userText, sessionIdRef.current, abortRef.current.signal);

      // Persist the session id so the next turn keeps context
      if (res.sessionId && res.sessionId !== sessionIdRef.current) {
        sessionIdRef.current = res.sessionId;
        setStoredSessionId(res.sessionId);
      }

      // Bot reply text
      if (res.reply) {
        pushMessage({ sender: 'bot', kind: 'text', text: res.reply });
      }

      // Product carousel (if the agent recommended anything)
      if (res.products && res.products.length > 0) {
        pushMessage({ sender: 'bot', kind: 'product-carousel', products: res.products });
      }

      // Quick-reply chips
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

  /* First contact — triggers a real "Bonjour" so the agent introduces itself. */
  const startConversation = useCallback(async () => {
    if (hasStarted) return;
    setHasStarted(true);
    await callBackend(WELCOME_TRIGGER);
  }, [hasStarted, callBackend]);

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
