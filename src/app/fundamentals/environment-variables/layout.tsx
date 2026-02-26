import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Environment Variables",
  description: "Secure your secrets with environment variables, .env files, and pydantic-settings in FastAPI applications.",
  openGraph: {
    title: "Environment Variables",
    description: "Secure your secrets with environment variables, .env files, and pydantic-settings in FastAPI applications.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
