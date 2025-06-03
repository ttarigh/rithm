import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL('https://rithm.love'),
  title: "rithm.love",
  description: "find your scrollmate.",
  openGraph: {
    title: "rithm.love",
    description: "find your scrollmate.",
    url: "https://rithm.love",
    type: "website",
    images: [
      {
        url: '/preview.gif',
        width: 640,
        height: 1138,
        alt: 'rithm.love preview',
        type: 'image/gif',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "rithm.love",
    description: "find your scrollmate.",
    images: [
      {
        url: '/preview.gif',
        width: 640,
        height: 1138,
        alt: 'rithm.love preview',
        type: 'image/gif',
      },
    ],
    // creator: "@yourtwitterhandle", // Optional: add your Twitter handle
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/apple-icon.png', // We'll create apple-icon.js that generates this path
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
