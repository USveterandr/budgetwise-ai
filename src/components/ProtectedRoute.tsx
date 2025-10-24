"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/lib/auth-client";

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: { 
  children: React.ReactNode; 
  requireAdmin?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      // Check if the user is authenticated
      if (!isAuthenticated()) {
        // Redirect to login if not authenticated
        router.push("/auth/login");
        return;
      }
      
      // Get current user
      const user = getCurrentUser();
      
      // Check if email is verified
      if (user && !user.emailVerified) {
        // Redirect to email confirmation page
        router.push("/auth/confirm-email");
        return;
      }
      
      // If admin is required, check if user is admin
      if (requireAdmin) {
        if (!user || !user.isAdmin) {
          // Redirect to dashboard if not admin
          router.push("/dashboard");
          return;
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [router, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}