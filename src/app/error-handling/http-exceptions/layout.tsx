import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTTP Exceptions",
  description: "Raise proper HTTP error responses with status codes, detail messages, and custom headers in FastAPI.",
  openGraph: {
    title: "HTTP Exceptions",
    description: "Raise proper HTTP error responses with status codes, detail messages, and custom headers in FastAPI.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
