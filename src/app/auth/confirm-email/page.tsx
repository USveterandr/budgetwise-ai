"use client";

import React from "react";
import { lazy, Suspense } from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

// Dynamically import the client component to avoid SSR issues
const ConfirmEmailClient = lazy(() => import('@/components/auth/ConfirmEmailClient'));

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ConfirmEmailClient />
    </Suspense>
  );
}