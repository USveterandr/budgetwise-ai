"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8">
          Oops! The page you're looking for doesn't exist.
        </p>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5">
          <Link href="/" className="w-full h-full flex items-center justify-center">
            Go Back Home
          </Link>
        </Button>
      </div>
    </div>
  );
}