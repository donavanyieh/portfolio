import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Donavan | Data Scientist",
  description:
    "A professional, exploratory DataOS portfolio for Donavan, focused on GenAI, machine learning, data products, and analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
