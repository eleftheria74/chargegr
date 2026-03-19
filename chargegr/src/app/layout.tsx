import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PlugMeNow - Σταθμοί Φόρτισης EV",
  description: "Βρες σταθμό φόρτισης ηλεκτρικού αυτοκινήτου στην Ελλάδα. Χάρτης με όλους τους σταθμούς, φίλτρα, vehicle profiles.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PlugMeNow",
  },
  openGraph: {
    title: "PlugMeNow - Σταθμοί Φόρτισης EV",
    description: "Βρες σταθμό φόρτισης ηλεκτρικού αυτοκινήτου στην Ελλάδα",
    siteName: "PlugMeNow",
    type: "website",
    locale: "el_GR",
  },
  twitter: {
    card: "summary",
    title: "PlugMeNow - Σταθμοί Φόρτισης EV",
    description: "Βρες σταθμό φόρτισης ηλεκτρικού αυτοκινήτου στην Ελλάδα",
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: ["EV", "charging", "σταθμός φόρτισης", "ηλεκτρικό αυτοκίνητο", "Ελλάδα", "PlugMeNow"],
};

export const viewport: Viewport = {
  themeColor: "#1B7B4E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="el">
      <head>
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
