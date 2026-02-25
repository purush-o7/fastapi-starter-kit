import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Headers & Cookies",
  description: "Read request headers, manage cookies, and set custom response headers in FastAPI.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
