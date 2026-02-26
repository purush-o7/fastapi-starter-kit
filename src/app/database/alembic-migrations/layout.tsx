import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Alembic Migrations",
  description: "Track and apply database schema changes with Alembic auto-generated migrations for FastAPI projects.",
  openGraph: {
    title: "Alembic Migrations",
    description: "Track and apply database schema changes with Alembic auto-generated migrations for FastAPI projects.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
