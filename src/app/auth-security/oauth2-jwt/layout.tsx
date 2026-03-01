import type { Metadata } from "next";
import { JsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  title: "OAuth2 + JWT",
  description: "Implement secure authentication with OAuth2 password flow and JWT tokens in FastAPI applications.",
  openGraph: {
    title: "OAuth2 + JWT",
    description: "Implement secure authentication with OAuth2 password flow and JWT tokens in FastAPI applications.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={{
          "@type": ["Article", "LearningResource"],
          headline: "OAuth2 + JWT",
          description: "Implement secure authentication with OAuth2 password flow and JWT tokens in FastAPI applications.",
          author: { "@type": "Person", name: "Purushottam Reddy" },
          publisher: { "@type": "Organization", name: "What is FastAPI" },
          educationalLevel: "Advanced",
          learningResourceType: "tutorial",
          about: { "@type": "Thing", name: "FastAPI" },
          inLanguage: "en",
          url: "https://fastapi101.vercel.app/auth-security/oauth2-jwt",
        }}
      />
      <JsonLd
        data={{
          "@type": "FAQPage",
          mainEntity: [
      { "@type": "Question", name: "Are JWT tokens encrypted?", acceptedAnswer: { "@type": "Answer", text: "No. JWTs are base64-encoded, not encrypted. Anyone can decode and read the payload. The signature only prevents tampering, not reading. Never put sensitive data like passwords in a JWT payload." } },
      { "@type": "Question", name: "How do you implement JWT authentication in FastAPI?", acceptedAnswer: { "@type": "Answer", text: "Create a /token endpoint that validates credentials and returns a JWT. Use OAuth2PasswordBearer as a dependency to extract the token from requests. Decode and verify the token in a get_current_user dependency." } }
          ],
        }}
      />
      {children}
    </>
  );
}
