import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Headers & Cookies",
  description: "Read and set HTTP headers and cookies in FastAPI with automatic validation and security flags.",
  openGraph: {
    title: "Headers & Cookies",
    description: "Read and set HTTP headers and cookies in FastAPI with automatic validation and security flags.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
