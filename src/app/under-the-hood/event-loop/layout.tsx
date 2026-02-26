import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Loop",
  description: "Understand how Python asyncio event loop powers FastAPI concurrency and why blocking calls freeze everything.",
  openGraph: {
    title: "Event Loop",
    description: "Understand how Python asyncio event loop powers FastAPI concurrency and why blocking calls freeze everything.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
