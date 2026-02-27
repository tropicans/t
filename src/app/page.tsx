import { redirect } from "next/navigation";
import type { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://t.ppkasn.id";

export const metadata: Metadata = {
  title: "Taut - Microsite & URL Shortener",
  description: "Buat microsite dan short link yang bisa dilacak performanya.",
  openGraph: {
    title: "Taut - Microsite & URL Shortener",
    description: "Buat microsite dan short link yang bisa dilacak performanya.",
    url: APP_URL,
    siteName: "Taut",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Taut - Microsite & URL Shortener",
    description: "Buat microsite dan short link yang bisa dilacak performanya.",
  },
};

export default function Home() {
  redirect("/dashboard");
}
