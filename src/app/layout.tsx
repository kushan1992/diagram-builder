import type { Metadata } from "next";
import { Inter } from "next/font/google";
// @ts-expect-error: Allow importing global CSS without type declarations
import "./globals.css";
import ToastProvider from "@/components/toastProvider/ToastProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Diagram Builder - Visual Diagrams with Authentication",
  description: "Create and manage diagrams with role-based access control",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <html lang="en">
        <body className={inter.className}>
          {children}
          <ToastProvider />
        </body>
      </html>
    </>
  );
}
