import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OAuth2 + JWT",
  description: "Implement secure authentication with OAuth2 password flow and JWT tokens in FastAPI applications.",
  openGraph: {
    title: "OAuth2 + JWT",
    description: "Implement secure authentication with OAuth2 password flow and JWT tokens in FastAPI applications.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
