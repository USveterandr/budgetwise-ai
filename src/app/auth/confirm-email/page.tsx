import ConfirmEmailClient from "@/components/auth/ConfirmEmailClient";

export default function ConfirmEmailPage() {
  return <ConfirmEmailClient />;
}

// Provide a loading fallback for static export
export function loading() {
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