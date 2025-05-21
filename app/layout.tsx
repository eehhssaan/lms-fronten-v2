import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

// Define metadata for the page
export const metadata = {
  title: "Learning Management System",
  description: "A MUJI-inspired minimalist LMS platform",
};

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-opensans",
});

// Import client components for the actual layout rendering
import ClientLayout from "@/components/ClientLayout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${openSans.variable}`}
        style={{
          margin: 0,
          backgroundColor: "#f0f0f0",
          height: "100vh",
        }}
      >
        <ClientLayout montserrat={montserrat} openSans={openSans}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
