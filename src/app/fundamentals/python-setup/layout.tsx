import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Python Setup",
  description: "Set up Python virtual environments, install FastAPI and Uvicorn, and configure your development environment correctly.",
  openGraph: {
    title: "Python Setup",
    description: "Set up Python virtual environments, install FastAPI and Uvicorn, and configure your development environment correctly.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
