import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Python Setup",
  description: "Virtual environments, pip, and requirements.txt",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
