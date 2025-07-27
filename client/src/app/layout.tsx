import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import { ThemeProvider } from '@/components/ThemeProvider';
import ThemeToggle from '@/components/ThemeToggle';
import QueryProvider from '@/components/QueryProvider';
import { Suspense } from 'react';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Time Tracker",
  description: "Track your time efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center p-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Time Tracker</h1>
                  <SignedIn>
                    <Suspense fallback={<div>Loading...</div>}>
                      <Navbar />
                    </Suspense>
                  </SignedIn>
                </div>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <SignedOut>
                    <SignInButton>
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                        Sign In
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 border border-transparent rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                        Sign Up
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              </div>
            </header>
            <main>
              <QueryProvider>
                {children}
              </QueryProvider>
            </main>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
