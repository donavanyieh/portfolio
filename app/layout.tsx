import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Donavan | Data Scientist",
  description:
    "I am an AI engineer based in Singapore. Welcome to my MacOS like portfolio :)",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
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
