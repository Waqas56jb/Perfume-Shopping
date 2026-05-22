# Eleganza · Customer Chatbot Frontend

Conversational chatbot UI for the Eleganza perfume website. Frontend only — backend integration comes later.

## Stack

- Vite + React 18 + TypeScript
- TailwindCSS 3
- Framer Motion (animations)
- lucide-react (icons)

## Getting started

```bash
cd client
npm install
npm run dev
```

Opens on http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Notes

- Replies are scripted/mocked for the demo (see `src/hooks/useChat.ts` and `src/data/mockData.ts`). Replace `useChat` with a real API call once the server is ready.
- Theme tokens live in `tailwind.config.js` under `colors.cream / ink / gold`.
- The widget mounts via `<ChatWidget />` — drop it into any page to embed.
