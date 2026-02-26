import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Background Tasks",
  description: "Run email sending, logging, and other slow operations after returning the response with FastAPI BackgroundTasks.",
  openGraph: {
    title: "Background Tasks",
    description: "Run email sending, logging, and other slow operations after returning the response with FastAPI BackgroundTasks.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
