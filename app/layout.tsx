import { Inter } from "next/font/google";
import "./globals.css";

// Define metadata for the page
export const metadata = {
  title: "Learning Management System",
  description: "A MUJI-inspired minimalist LMS platform",
};

const inter = Inter({ subsets: ["latin"] });

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
        className={`${inter.className}`}
        style={{
          margin: 0,
          backgroundColor: "#f0f0f0",
          height: "100vh",
        }}
      >
        <ClientLayout inter={inter}>{children}</ClientLayout>
      </body>
    </html>
  );
}
