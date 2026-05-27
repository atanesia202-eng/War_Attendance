import type { Metadata } from "next";
import "./globals.css";
import { DataProvider } from "@/context/DataContext";

export const metadata: Metadata = {
  title: "HOF Attendance Dashboard | Alliance War Management",
  description: "Real-time MMORPG attendance tracking for the HOF Alliance. Monitor war participation, activity stats, and member performance across all servers.",
  keywords: "HOF, attendance, MMORPG, war, guild, BDO, alliance, dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning className="bg-slate-950 text-slate-100 min-h-screen">
        <DataProvider>
          {children}
        </DataProvider>
      </body>
    </html>
  );
}
