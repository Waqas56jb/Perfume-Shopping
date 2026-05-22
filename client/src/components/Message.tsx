import { motion } from 'framer-motion';
import ReactMarkdown, { type Components } from 'react-markdown';
import type { ChatMessage } from '../types/chat';
import { Logo } from './Logo';

interface MessageProps {
  message: ChatMessage;
}

/** Markdown → React element mapping, tuned for a chat bubble (compact spacing). */
const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="font-display text-[17px] leading-tight mt-2.5 mb-1.5 first:mt-0 text-ink-900">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-display text-[16px] leading-tight mt-2.5 mb-1 first:mt-0 text-ink-900">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-sans font-semibold text-[14.5px] tracking-wide mt-2 mb-1 first:mt-0 text-ink-900">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-2 last:mb-0 space-y-1 pl-5 list-disc marker:text-ink-300">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 last:mb-0 space-y-1.5 pl-5 list-decimal marker:text-ink-300 marker:font-mono marker:text-[12px]">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-relaxed pl-1">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold tracking-wide text-ink-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-ink-400">{children}</em>,
  code: ({ children }) => (
    <code className="font-mono text-[12.5px] bg-ink-900/5 text-ink-900 px-1.5 py-0.5 rounded-md">
      {children}
    </code>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ink-900 underline underline-offset-4 decoration-ink-300 hover:decoration-ink-900 transition-colors"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-ink-900/10" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-ink-900/20 pl-3 italic text-ink-400 my-2">
      {children}
    </blockquote>
  ),
};

export function Message({ message }: MessageProps) {
  const isBot = message.sender === 'bot';
  const text = message.text ?? '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex items-end gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
    >
      {isBot && (
        <div className="flex-shrink-0 mb-0.5">
          <Logo size={28} variant="dark" />
        </div>
      )}

      <div
        className={`
          max-w-[78%] sm:max-w-[75%] px-4 py-3 text-[14.5px] leading-relaxed shadow-card
          ${
            isBot
              ? 'bg-cream-100 text-ink-900 rounded-2xl rounded-bl-md'
              : 'bg-ink-900 text-cream-100 rounded-2xl rounded-br-md'
          }
        `}
      >
        {isBot ? (
          <div className="text-balance">
            <ReactMarkdown components={markdownComponents}>{text}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-balance whitespace-pre-wrap">{text}</p>
        )}
      </div>
    </motion.div>
  );
}
