import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { ChatMessage, QuickReply } from '../types/chat';
import { Message } from './Message';
import { QuickReplies } from './QuickReplies';
import { ProductCard } from './ProductCard';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onQuickReply: (qr: QuickReply) => void;
}

export function MessageList({ messages, isTyping, onQuickReply }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 scrollbar-elegant"
    >
      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            if (msg.kind === 'text') {
              return <Message key={msg.id} message={msg} />;
            }

            if (msg.kind === 'quick-replies' && msg.quickReplies) {
              return (
                <QuickReplies
                  key={msg.id}
                  replies={msg.quickReplies}
                  onSelect={onQuickReply}
                />
              );
            }

            if (msg.kind === 'product-carousel' && msg.products) {
              return (
                <div
                  key={msg.id}
                  className="flex gap-3 overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5 pb-2 scrollbar-elegant snap-x snap-mandatory"
                >
                  {msg.products.map((p, idx) => (
                    <div key={p.id} className="snap-start">
                      <ProductCard product={p} index={idx} />
                    </div>
                  ))}
                </div>
              );
            }

            return null;
          })}

          {isTyping && (
            <div key="typing-indicator">
              <TypingIndicator />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
