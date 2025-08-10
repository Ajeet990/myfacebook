"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <h2 className="text-2xl font-semibold mt-4 text-gray-800">
        Oops! Page not found
      </h2>
      <p className="text-gray-600 mt-2">
        The page you’re looking for doesn’t exist or has been moved.
      </p>

      <div className="flex gap-4 mt-6">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
        >
          Go Back
        </button>

        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
