import { ChatWindow } from './components/ChatWindow';

export default function App() {
  return (
    <div
      className="
        relative
        min-h-screen min-h-[100dvh]
        flex items-center justify-center
        p-0 sm:p-6
        overflow-hidden
        bg-[#15110D]
      "
    >
      {/* Ambient warm radial — gives the cream panel a 'spotlight' lift */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(ellipse_55%_55%_at_50%_50%,rgba(237,229,216,0.08),transparent_70%)]
        "
      />
      {/* Subtle film grain on the dark canvas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <ChatWindow />
    </div>
  );
}
