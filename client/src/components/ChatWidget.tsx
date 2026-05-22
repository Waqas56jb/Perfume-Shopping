import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatBubble } from './ChatBubble';
import { ChatWindow } from './ChatWindow';

/**
 * Floating-widget variant of the chat (bubble + popup).
 * Currently unused — the active layout in App.tsx renders <ChatWindow /> standalone, centered.
 * Kept available for future embed scenarios.
 */
export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ChatBubble onClick={() => setIsOpen(true)} isOpen={isOpen} />
      <AnimatePresence>
        {isOpen && <ChatWindow onClose={() => setIsOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
