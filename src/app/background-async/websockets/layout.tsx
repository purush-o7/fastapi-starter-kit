import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WebSockets",
  description: "Real-time bidirectional communication with FastAPI WebSocket endpoints.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
