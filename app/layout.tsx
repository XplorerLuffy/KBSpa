import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { absoluteUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl()),
  title: {
    default: "Kuenphen Beauty Spa — Relax. Refresh. Rejuvenate.",
    template: "%s | Kuenphen Beauty Spa",
  },
  description:
    "Premium beauty and wellness treatments tailored just for you. Book facials, massage, hair, body spa and bridal services at Kuenphen Beauty Spa.",
  keywords: [
    "beauty spa",
    "massage",
    "facial",
    "hair salon",
    "bridal makeup",
    "body spa",
    "Kuenphen Beauty Spa",
  ],
  openGraph: {
    type: "website",
    siteName: "Kuenphen Beauty Spa",
    title: "Kuenphen Beauty Spa — Relax. Refresh. Rejuvenate.",
    description: "Premium beauty and wellness treatments tailored just for you.",
    url: absoluteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: "Kuenphen Beauty Spa — Relax. Refresh. Rejuvenate.",
    description: "Premium beauty and wellness treatments tailored just for you.",
  },
  icons: { icon: "/logo.svg", apple: "/logo.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdfbf7" },
    { media: "(prefers-color-scheme: dark)", color: "#17161a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body className="antialiased">
        <ThemeProvider>
          <a
            href="#main"
            className="bg-gold-500 text-charcoal-900 sr-only rounded-full px-4 py-2 font-medium focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]"
          >
            Skip to content
          </a>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
