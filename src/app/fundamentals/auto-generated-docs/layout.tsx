import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auto-Generated Docs",
  description: "FastAPI automatically generates Swagger UI and ReDoc documentation from your type hints and Pydantic models.",
  openGraph: {
    title: "Auto-Generated Docs",
    description: "FastAPI automatically generates Swagger UI and ReDoc documentation from your type hints and Pydantic models.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
