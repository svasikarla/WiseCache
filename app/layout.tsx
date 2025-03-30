import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { GuestProvider } from "@/contexts/GuestContext";
import { SupabaseProvider } from "@/contexts/SupabaseContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WiSECache - Smart Link Management",
  description: "Save and organize your links with AI-powered summaries and categorization",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseProvider>
          <GuestProvider>
            {children}
            <Toaster 
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#22c55e',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
          </GuestProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}



import './globals.css'