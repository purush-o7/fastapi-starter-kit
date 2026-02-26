import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Database Sessions",
  description: "Manage database connections with SQLAlchemy sessions, connection pooling, and proper cleanup in FastAPI.",
  openGraph: {
    title: "Database Sessions",
    description: "Manage database connections with SQLAlchemy sessions, connection pooling, and proper cleanup in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
