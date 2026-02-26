import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Error Handlers",
  description: "Override default error responses with custom exception handlers for consistent API error formats.",
  openGraph: {
    title: "Custom Error Handlers",
    description: "Override default error responses with custom exception handlers for consistent API error formats.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
