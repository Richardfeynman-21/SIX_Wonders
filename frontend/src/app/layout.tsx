import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAKSHAK-Mine | AI-Powered Underground Mine Safety, Monitoring & Rescue Rover",
  description: "Real-time subterranean surface monitoring and rescue rover control dashboard for underground coal mines compliant with DGMS CMR 2017.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 min-h-screen font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
