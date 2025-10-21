"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmailToken } from "@/lib/email";
import { Button } from "@/components/ui/button";

export default function ConfirmEmailClient() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid confirmation link. Token is missing.");
        return;
      }

      try {
        const result = await verifyEmailToken(token);
        
        if (result.success) {
          setStatus("success");
          setMessage(result.message || "Email confirmed successfully. You can now log in to your account.");
        } else {
          setStatus("error");
          setMessage(result.error || "Email confirmation failed.");
        }
      } catch (error) {
        console.error("Email confirmation error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred during email confirmation.");
      }
    };

    confirmEmail();
  }, [token]);

  const handleLoginRedirect = () => {
    router.push("/auth/login");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Email</h1>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {status === "success" ? (
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {status === "success" ? "Email Verified" : "Verification Failed"}
            </h1>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {status === "success" && (
              <Button 
                onClick={handleLoginRedirect}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue to Login
              </Button>
            )}
            
            {status === "error" && (
              <div className="space-y-3">
                <Button 
                  onClick={handleLoginRedirect}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Try Again
                </Button>
                <p className="text-sm text-gray-500">
                  If you continue to have issues, please contact support.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}