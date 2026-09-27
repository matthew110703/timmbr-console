import type { Metadata } from "next";
import { DM_Serif_Display, Manrope, Outfit } from "next/font/google";
import { TimmbrConfigProvider } from "@timmbr/ui";
import "./globals.css";
import { strings } from "./strings";

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
});

export const metadata: Metadata = {
  title: strings.metadata.title,
  description: strings.metadata.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      style={{ colorScheme: "light" }}
      className={`${manrope.variable} ${dmSerif.variable} ${outfit.variable}`}
    >
      <body>
        <TimmbrConfigProvider
          config={{
            theme: { mode: "light" },
            toast: { position: "bottom-right", duration: 4000 },
          }}
        >
          {children}
        </TimmbrConfigProvider>
      </body>
    </html>
  );
}
