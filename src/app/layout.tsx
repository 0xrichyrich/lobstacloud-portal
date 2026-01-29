import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LobstaCloud Portal",
  description: "Manage your LobstaCloud gateway and channels",
  metadataBase: new URL('https://portal.redlobsta.com'),
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🦞</text></svg>",
  },
  openGraph: {
    title: "LobstaCloud Portal",
    description: "Manage your LobstaCloud gateway and channels",
    url: "https://portal.redlobsta.com",
    siteName: "LobstaCloud Portal",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LobstaCloud Portal",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LobstaCloud Portal",
    description: "Manage your LobstaCloud gateway and channels",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
