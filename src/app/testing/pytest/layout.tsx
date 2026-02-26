import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testing with Pytest",
  description: "Write reliable API tests with TestClient, dependency overrides, and database fixtures for FastAPI.",
  openGraph: {
    title: "Testing with Pytest",
    description: "Write reliable API tests with TestClient, dependency overrides, and database fixtures for FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
