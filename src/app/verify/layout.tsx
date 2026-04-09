import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Profile — College Management Portal",
  description:
    "Public profile verification page for students, faculty, and administrators at Govt. Graduate College, Hafizabad.",
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
