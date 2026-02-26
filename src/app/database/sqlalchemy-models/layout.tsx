import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SQLAlchemy Models",
  description: "Define database tables as Python classes with SQLAlchemy ORM, relationships, and constraints for FastAPI.",
  openGraph: {
    title: "SQLAlchemy Models",
    description: "Define database tables as Python classes with SQLAlchemy ORM, relationships, and constraints for FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
