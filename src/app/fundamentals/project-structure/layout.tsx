import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Structure",
  description: "Organize your FastAPI project with modular folders, avoid circular imports, and scale beyond a single main.py file.",
  openGraph: {
    title: "Project Structure",
    description: "Organize your FastAPI project with modular folders, avoid circular imports, and scale beyond a single main.py file.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
