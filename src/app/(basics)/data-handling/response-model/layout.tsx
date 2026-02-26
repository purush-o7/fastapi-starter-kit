import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Response Model",
  description: "Control API response shapes, filter sensitive fields, and prevent data leaks with FastAPI response models.",
  openGraph: {
    title: "Response Model",
    description: "Control API response shapes, filter sensitive fields, and prevent data leaks with FastAPI response models.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
