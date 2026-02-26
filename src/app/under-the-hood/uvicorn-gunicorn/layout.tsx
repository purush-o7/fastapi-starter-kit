import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uvicorn & Gunicorn",
  description: "Deploy FastAPI in production with Uvicorn workers, Gunicorn process management, and proper scaling.",
  openGraph: {
    title: "Uvicorn & Gunicorn",
    description: "Deploy FastAPI in production with Uvicorn workers, Gunicorn process management, and proper scaling.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
