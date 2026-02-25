import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Body",
  description: "Accept and validate JSON request bodies with Pydantic models in FastAPI.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
