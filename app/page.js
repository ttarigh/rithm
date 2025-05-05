import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-6xl font-bold tracking-tight sm:text-7xl">
          Rithm
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
          Find your rhythm. Connect with others through the vibe of your Instagram explore page.
        </p>

        <Link href="/login">
          <span className="inline-block rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 cursor-pointer">
            Get Started / Login
          </span>
        </Link>
      </main>

      <footer className="absolute bottom-8 text-xs text-gray-500 flex space-x-4">
        <span>Welcome to Rithm.</span>
        <Link href="/about">
          <span className="hover:underline cursor-pointer">About</span>
        </Link>
      </footer>
    </div>
  );
}
