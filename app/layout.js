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
  title: "rithm.love",
  description: "find your scrollmate.",
  openGraph: {
    title: "rithm.love",
    description: "find your scrollmate.",
    url: "https://rithm.love", // Replace with your actual domain
    siteName: "rithm.love",
    type: "website",
  },
  twitter: {
    card: "summary", // Or "summary_large_image" if you have a large image
    title: "rithm.love",
    description: "find your scrollmate.",
    // creator: "@yourtwitterhandle", // Optional: add your Twitter handle
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
