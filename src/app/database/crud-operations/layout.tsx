import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CRUD Operations",
  description: "Build Create, Read, Update, Delete functions with SQLAlchemy queries and FastAPI dependency injection.",
  openGraph: {
    title: "CRUD Operations",
    description: "Build Create, Read, Update, Delete functions with SQLAlchemy queries and FastAPI dependency injection.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
