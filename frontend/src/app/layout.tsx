import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import Preloader from "@/components/Preloader";
import AnimationProvider from "@/components/providers/AnimationProvider";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Cursor from "@/components/ui/Cursor";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Shivaprasad Tiwari — Full Stack Developer",
  description:
    "Full stack developer building backends with NestJS and Python FastAPI, and interfaces with React. Previously MERN at ePrabhidi, currently at ASI Tech.",
  openGraph: {
    title: "Shivaprasad Tiwari — Full Stack Developer",
    description:
      "Backends with NestJS and FastAPI. Interfaces with React. Selected work, writing, and contact.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${interTight.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="grain min-h-full bg-ink text-bone">
        <AnimationProvider>
          <SmoothScroll>
            <Preloader />
            <Cursor />
            {children}
          </SmoothScroll>
        </AnimationProvider>
      </body>
    </html>
  );
}
