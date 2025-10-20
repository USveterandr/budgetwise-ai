"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmEmail } from "@/lib/auth";

export default function ConfirmEmailClient() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Skip execution during server-side rendering
    if (typeof window === 'undefined') return;
    
    const confirmToken = searchParams.get('token');
    
    if (!confirmToken) {
      setError("Invalid confirmation link");
      setIsLoading(false);
      return;
    }
    
    const confirmEmailAndRedirect = async () => {
      try {
        const result = await confirmEmail(confirmToken);
        
        if (result.success) {
          setIsSuccess(true);
        } else {
          setError(result.error || "Email confirmation failed");
        }
      } catch (error) {
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    confirmEmailAndRedirect();
  }, [searchParams]);

  // Show loading state during SSR
  if (typeof window === 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Confirming your email...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          {isSuccess ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Email Confirmed!</h1>
              <p className="text-gray-600 mb-6">
                Your email has been successfully confirmed. You can now access all features of BudgetWise AI.
              </p>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue to Dashboard
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirmation Failed</h1>
              <p className="text-gray-600 mb-6">
                {error || "We couldn't confirm your email. The confirmation link may be invalid or expired."}
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push("/auth/login")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Go to Login
                </Button>
                <p className="text-sm text-gray-600">
                  Need a new confirmation link?{" "}
                  <Link href="/auth/signup" className="font-medium text-blue-600 hover:underline">
                    Sign up again
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}