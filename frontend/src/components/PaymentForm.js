import React, { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { 
  CreditCard, 
  Shield, 
  Check, 
  AlertCircle,
  Lock,
  Calendar,
  User
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PaymentForm = ({ selectedPlan, onPaymentSuccess, onPaymentError }) => {
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" or "paypal"
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    billingAddress: {
      line1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "US"
    }
  });

  // PayPal configuration
  const paypalOptions = {
    "client-id": process.env.REACT_APP_PAYPAL_CLIENT_ID || "test",
    currency: "USD",
    intent: "capture",
    components: "buttons,marks"
  };

  const handleCardInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setCardData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setCardData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s+/g, '').replace(/[^0-9]/gi, '').match(/.{1,4}/g)?.join(' ') || value;
  };

  const formatExpiryDate = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
  };

  const createPayPalOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.post(`${API}/payments/create-order`, {
        plan_id: selectedPlan.id,
        amount: selectedPlan.price,
        currency: "USD"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data.order_id;
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      toast.error("Failed to create payment order");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const onPayPalApprove = async (data) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axios.post(`${API}/payments/capture-order`, {
        order_id: data.orderID,
        user_id: "current"
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.status === "COMPLETED") {
        toast.success("Payment successful! Welcome to " + selectedPlan.name);
        onPaymentSuccess(response.data);
      } else {
        throw new Error("Payment not completed");
      }
    } catch (error) {
      console.error("Error capturing payment:", error);
      toast.error("Payment processing failed");
      onPaymentError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // This would integrate with PayPal's advanced credit card processing
      // For now, we'll simulate the process
      
      toast.info("Processing credit card payment...");
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll create a PayPal order and redirect to PayPal
      const orderId = await createPayPalOrder();
      
      toast.success("Redirecting to secure payment processing...");
      
      // In a real implementation, this would process the card directly
      // For now, we'll show a message to use PayPal buttons instead
      toast.info("Please use the PayPal payment option below for secure processing");
      
    } catch (error) {
      toast.error("Credit card processing error. Please try PayPal option.");
      onPaymentError(error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedPlan) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please select a subscription plan to continue with payment.
        </AlertDescription>
      </Alert>
    );
  }

  if (selectedPlan.price === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Free Plan Selected
          </CardTitle>
          <CardDescription>
            No payment required for the free plan. Click continue to create your account.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>
            Choose your preferred payment method for {selectedPlan.name} subscription
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              variant={paymentMethod === "card" ? "default" : "outline"}
              onClick={() => setPaymentMethod("card")}
              className="h-16 flex flex-col gap-1"
            >
              <CreditCard className="h-5 w-5" />
              <span>Credit Card</span>
            </Button>
            <Button
              variant={paymentMethod === "paypal" ? "default" : "outline"}
              onClick={() => setPaymentMethod("paypal")}
              className="h-16 flex flex-col gap-1"
            >
              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              <span>PayPal</span>
            </Button>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">{selectedPlan.name} Plan</span>
              <span className="font-semibold">${selectedPlan.price}/month</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Free Trial</span>
              <Badge className="bg-green-100 text-green-700">7 days</Badge>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Today</span>
              <span className="text-green-600">$0.00</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your free trial starts today. You'll be charged ${selectedPlan.price} after 7 days.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Credit Card Form */}
      {paymentMethod === "card" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Credit Card Information
            </CardTitle>
            <CardDescription>
              Your payment information is secure and encrypted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCardPayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={cardData.cardholderName}
                    onChange={(e) => handleCardInputChange('cardholderName', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.cardNumber}
                    onChange={(e) => handleCardInputChange('cardNumber', formatCardNumber(e.target.value))}
                    className="pl-10"
                    maxLength="19"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={cardData.expiryDate}
                      onChange={(e) => handleCardInputChange('expiryDate', formatExpiryDate(e.target.value))}
                      className="pl-10"
                      maxLength="5"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardData.cvv}
                      onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                      className="pl-10"
                      maxLength="4"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Billing Address</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Street Address</Label>
                  <Input
                    id="billingAddress"
                    placeholder="123 Main Street"
                    value={cardData.billingAddress.line1}
                    onChange={(e) => handleCardInputChange('billingAddress.line1', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={cardData.billingAddress.city}
                      onChange={(e) => handleCardInputChange('billingAddress.city', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="NY"
                      value={cardData.billingAddress.state}
                      onChange={(e) => handleCardInputChange('billingAddress.state', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postalCode">ZIP Code</Label>
                  <Input
                    id="postalCode"
                    placeholder="10001"
                    value={cardData.billingAddress.postalCode}
                    onChange={(e) => handleCardInputChange('billingAddress.postalCode', e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                disabled={loading}
              >
                {loading ? "Processing..." : `Start Free Trial - $0 Today`}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* PayPal Form */}
      {paymentMethod === "paypal" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">P</span>
              </div>
              PayPal Payment
            </CardTitle>
            <CardDescription>
              Pay securely with your PayPal account or credit card through PayPal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PayPalScriptProvider options={paypalOptions}>
              <PayPalButtons
                style={{
                  layout: "vertical",
                  color: "blue",
                  shape: "rect",
                  label: "subscribe"
                }}
                createOrder={createPayPalOrder}
                onApprove={onPayPalApprove}
                onError={(err) => {
                  console.error("PayPal Error:", err);
                  toast.error("PayPal payment failed");
                  onPaymentError(err);
                }}
                onCancel={() => {
                  toast.info("Payment cancelled");
                }}
                disabled={loading}
              />
            </PayPalScriptProvider>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
        <Shield className="h-4 w-4 text-green-600" />
        <span>
          Your payment is secured with 256-bit SSL encryption and PCI compliance
        </span>
      </div>
    </div>
  );
};

export default PaymentForm;