"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@emotion/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { NextFontWithVariable } from "next/dist/compiled/@next/font";

interface ClientLayoutProps {
  children: React.ReactNode;
  montserrat: NextFontWithVariable;
  openSans: NextFontWithVariable;
}

// MUJI-inspired theme with neutral colors
const theme = {
  colors: {
    background: "#FAFAFA",
    primary: "#595959",
    secondary: "#A3A3A3",
    accent: "#D9D9D9",
    text: "#333333",
    error: "#D32F2F",
    success: "#388E3C",
    warning: "#F57C00",
    info: "#1976D2",
    white: "#FFFFFF",
    lightGray: "#F5F5F5",
    border: "#E0E0E0",
  },
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: "var(--font-opensans)",
    heading: "var(--font-montserrat)",
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
  fontWeights: {
    body: 400,
    heading: 700,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.25,
  },
  shadows: {
    small: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
    large: "0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)",
  },
  radii: {
    default: "4px",
    round: "50%",
  },
  breakpoints: ["40em", "52em", "64em"],
};

export default function ClientLayout({
  children,
  montserrat,
  openSans,
}: ClientLayoutProps) {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <div
          className={`min-h-screen flex flex-col ${montserrat.variable} ${openSans.variable}`}
        >
          <Header />
          <main className="flex-grow w-full">{children}</main>
          <Footer />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}
