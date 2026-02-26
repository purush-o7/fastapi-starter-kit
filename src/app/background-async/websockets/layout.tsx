import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WebSockets",
  description: "Build real-time features like chat and live updates with WebSocket endpoints in FastAPI.",
  openGraph: {
    title: "WebSockets",
    description: "Build real-time features like chat and live updates with WebSocket endpoints in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
