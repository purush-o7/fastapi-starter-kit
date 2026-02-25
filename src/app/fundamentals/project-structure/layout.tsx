import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Project Structure",
  description: "Organizing your FastAPI application",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
