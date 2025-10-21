"use client";

import { useState } from "react";

export default function TestLoginPage() {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult("");
    try {
      console.log("Testing login...");
      const email = "login_test@example.com";
      const encodedEmail = encodeURIComponent(email);
      console.log("Encoded email:", encodedEmail);
      
      const response = await fetch(`https://budgetwise-database-worker.isaactrinidadllc.workers.dev/users/${encodedEmail}`);
      console.log("Response status:", response.status);
      
      const data = await response.json();
      console.log("Response data:", data);
      
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        setResult(`Error: ${error.message}`);
      } else {
        setResult(`Error: ${String(error)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Login API</h1>
          <button
            onClick={testLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md mb-4"
          >
            {loading ? "Testing..." : "Test Login API"}
          </button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h2 className="font-bold mb-2">Result:</h2>
              <pre className="text-sm overflow-auto">
                {result}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}