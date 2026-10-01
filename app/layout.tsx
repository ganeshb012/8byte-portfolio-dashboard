import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio Dashboard | 8byte Financial Analytics",
  description: "Dynamic Portfolio Tracker with Real-Time Market Feeds, Sector Analytics, and Fundamental Insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('portfolio-theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-[#f8fafc] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 min-h-screen selection:bg-blue-600 selection:text-white transition-colors duration-150 antialiased">
        {children}
      </body>
    </html>
  );
}
