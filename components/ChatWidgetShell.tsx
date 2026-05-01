// Server component: decides whether the chat widget should boot in
// AI-enabled or fallback-only mode based on env vars, then renders the
// client-side widget. Keeps the env check out of the client bundle.

import dynamic from "next/dynamic";

const ChatWidget = dynamic(() => import("./ChatWidget"));

export default function ChatWidgetShell() {
  const aiEnabled =
    process.env.CHAT_AI_ENABLED !== "false" && !!process.env.GEMINI_API_KEY;
  return <ChatWidget aiEnabled={aiEnabled} />;
}
