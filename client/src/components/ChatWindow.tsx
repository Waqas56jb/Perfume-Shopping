import { motion } from 'framer-motion';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { WelcomeScreen } from './WelcomeScreen';
import { useChat } from '../hooks/useChat';

interface ChatWindowProps {
  onClose?: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps = {}) {
  const { messages, isTyping, hasStarted, startConversation, sendUserMessage, sendQuickReply } =
    useChat();

  return (
    <motion.div
      key="chat-window"
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="
        relative z-10
        w-full h-[100dvh]
        sm:w-[420px] sm:h-[760px] sm:max-h-[calc(100dvh-3rem)]
        flex flex-col
        bg-cream-200
        sm:rounded-[32px]
        overflow-hidden
        grain
        sm:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.65),0_0_0_1px_rgba(237,229,216,0.06)]
      "
      role="dialog"
      aria-label="Conversation avec Eleganza"
    >
      <ChatHeader onClose={onClose} />

      {!hasStarted ? (
        <WelcomeScreen onStart={startConversation} />
      ) : (
        <MessageList messages={messages} isTyping={isTyping} onQuickReply={sendQuickReply} />
      )}

      {hasStarted && <ChatInput onSend={sendUserMessage} disabled={isTyping} />}
    </motion.div>
  );
}
