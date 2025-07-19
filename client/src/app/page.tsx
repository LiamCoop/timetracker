
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen">
      <header className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold">Time Tracker</h1>
        <div className="flex gap-4">
          <SignedOut>
            <SignInButton>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </header>
      <main className="flex flex-col gap-8 items-center justify-center min-h-[calc(100vh-120px)] p-8">
        <h2 className="text-4xl font-bold text-center">Welcome to Time Tracker</h2>
        <p className="text-xl text-gray-600 text-center max-w-2xl">
          Track your time efficiently and boost your productivity
        </p>
      </main>
    </div>
  );
}
