import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import InstallationIdentityBootstrap from "./components/InstallationIdentityBootstrap";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />

        {/* Favicon */}
        <link rel="icon" href="/icons/icon-192x192.png" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />
        <link rel="apple-touch-icon" sizes="1024x1024" href="/icons/icon-1024x1024.png" />

        {/* PWA Theme */}
        <meta name="theme-color" content="#1E120B" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#1E120B" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1E120B" />
        <meta name="background-color" content="#1E120B" />
        <meta name="msapplication-navbutton-color" content="#1E120B" />
        <meta name="color-scheme" content="dark" />

        {/* PWA iOS Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SPCS" />

        {/* Description */}
        <meta
          name="description"
          content="SPCS: Solar Powered Charging Station with real-time monitoring."
        />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <InstallationIdentityBootstrap />
        {children}
      </body>
    </html>
  );
}
