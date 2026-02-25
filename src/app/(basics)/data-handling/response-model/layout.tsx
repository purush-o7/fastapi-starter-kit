import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Response Model",
  description: "Control API response shape and filter sensitive fields automatically in FastAPI.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
