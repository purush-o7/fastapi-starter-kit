import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Environment Variables",
  description: "Secure configuration with .env files and pydantic-settings",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
