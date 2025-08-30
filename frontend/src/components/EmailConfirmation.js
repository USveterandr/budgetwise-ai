import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  Loader2, 
  PiggyBank,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading, success, error
  const [message, setMessage] = useState("");
  const [resendingEmail, setResendingEmail] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No confirmation token provided.");
      return;
    }

    confirmEmail(token);
  }, [token]);

  const confirmEmail = async (confirmationToken) => {
    try {
      const response = await axios.post(`${API}/auth/confirm-email`, {
        token: confirmationToken
      });
      
      setStatus("success");
      setMessage(response.data.message || "Email confirmed successfully!");
      
      toast.success("Email confirmed! Welcome to BudgetWise!");
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
      
    } catch (error) {
      setStatus("error");
      const errorMessage = error.response?.data?.detail || "Failed to confirm email. The link may be invalid or expired.";
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  const resendConfirmationEmail = async () => {
    setResendingEmail(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to resend confirmation email");
        navigate("/login");
        return;
      }

      await axios.post(`${API}/auth/resend-confirmation`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success("Confirmation email sent! Please check your inbox.");
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Failed to resend confirmation email";
      toast.error(errorMessage);
    } finally {
      setResendingEmail(false);
    }
  };

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-violet-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Confirming your email...
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your email address.
          </p>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Email Confirmed! 🎉
          </h2>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Redirecting you to your dashboard in a few seconds...
            </p>
            <Link to="/dashboard">
              <Button className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Confirmation Failed
          </h2>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          <div className="space-y-4">
            <Button 
              onClick={resendConfirmationEmail}
              disabled={resendingEmail}
              variant="outline"
              className="border-violet-200 text-violet-600 hover:bg-violet-50"
            >
              {resendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Confirmation Email
                </>
              )}
            </Button>
            <div className="text-sm text-gray-500">
              <p>Or</p>
              <Link to="/login" className="text-violet-600 hover:text-violet-700">
                Go back to login
              </Link>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex items-center justify-center">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl flex items-center justify-center">
              <PiggyBank className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">BudgetWise</span>
          </Link>
        </div>

        {/* Confirmation Card */}
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Email Confirmation</CardTitle>
            <CardDescription>
              Verifying your BudgetWise account
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {renderContent()}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Need help? Contact our{" "}
            <a href="#" className="text-violet-600 hover:text-violet-700">
              support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;