import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Encabezado from "./componentes/Encabezado";
import { UserProvider } from "./contextos/usuario";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gestión cuotas",
  description: "Gestión cuotas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserProvider>
          <div className="min-h-screen flex flex-col">
            <Encabezado />
            <main className="flex-1">{children}</main>
          </div>
        </UserProvider>
      </body>
    </html>
  );
}
