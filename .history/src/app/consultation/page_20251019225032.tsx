"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

export default function ConsultationPage() {
  const [consultations, setConsultations] = useState([
    { id: 1, advisorName: "Sarah Johnson", scheduledAt: "2023-06-20T10:00:00", durationMinutes: 30, status: "pending" },
    { id: 2, advisorName: "Michael Chen", scheduledAt: "2023-06-25T14:30:00", durationMinutes: 60, status: "completed" },
    { id: 3, advisorName: "Emma Rodriguez", scheduledAt: "2023-07-05T09:00:00", durationMinutes: 30, status: "pending" },
  ]);

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    advisor: "",
    date: "",
    time: "",
    duration: "30"
  });

  const advisors = [
    { id: 1, name: "Sarah Johnson", specialty: "Retirement Planning", rating: 4.9 },
    { id: 2, name: "Michael Chen", specialty: "Investment Strategy", rating: 4.8 },
    { id: 3, name: "Emma Rodriguez", specialty: "Tax Optimization", rating: 4.7 },
    { id: 4, name: "David Wilson", specialty: "Estate Planning", rating: 4.9 },
  ];

  const handleBookConsultation = () => {
    setShowBookingForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add new consultation
    const newConsultation = {
      id: consultations.length + 1,
      advisorName: formData.advisor,
      scheduledAt: `${formData.date}T${formData.time}:00`,
      durationMinutes: parseInt(formData.duration),
      status: "pending" as const
    };
    
    setConsultations([...consultations, newConsultation]);
    setShowBookingForm(false);
    setFormData({
      advisor: "",
      date: "",
      time: "",
      duration: "30"
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Consultation</h1>
          <p className="text-gray-600">Schedule a session with our certified financial advisors</p>
        </div>

        {/* Free Consultation Banner */}
        <Card className="mb-8 shadow-lg border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-gray-900">Free 30-Minute Consultation</h2>
                <p className="text-gray-600">Get personalized financial advice from our certified experts</p>
              </div>
              <Button 
                onClick={handleBookConsultation}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
              >
                <CalendarIcon className="h-5 w-5 mr-2" />
                Book Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {showBookingForm && (
          <Card className="mb-8 shadow">
            <CardHeader>
              <CardTitle>Book a Consultation</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="advisor" className="text-sm font-medium">Select Advisor</label>
                    <select
                      id="advisor"
                      value={formData.advisor}
                      onChange={(e) => setFormData({...formData, advisor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Choose an advisor</option>
                      {advisors.map((advisor) => (
                        <option key={advisor.id} value={advisor.name}>
                          {advisor.name} - {advisor.specialty} (★{advisor.rating})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="duration" className="text-sm font-medium">Duration</label>
                    <select
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="30">30 minutes (Free)</option>
                      <option value="60">60 minutes ($49)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="date" className="text-sm font-medium">Date</label>
                    <input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="time" className="text-sm font-medium">Time</label>
                    <input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Confirm Booking
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setShowBookingForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Advisors Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Financial Advisors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advisors.map((advisor) => (
              <Card key={advisor.id} className="shadow">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{advisor.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{advisor.specialty}</p>
                  <div className="flex items-center justify-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm font-medium text-gray-900">{advisor.rating}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Upcoming Consultations */}
        <Card className="shadow">
          <CardHeader>
            <CardTitle>Your Consultations</CardTitle>
          </CardHeader>
          <CardContent>
            {consultations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No consultations scheduled yet.</p>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div key={consultation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-3 rounded-full mr-4">
                        <CalendarIcon className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{consultation.advisorName}</h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {formatDateTime(consultation.scheduledAt)} • {consultation.durationMinutes} minutes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {consultation.status === "completed" ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircleIcon className="h-5 w-5 mr-1" />
                          Completed
                        </span>
                      ) : consultation.status === "pending" ? (
                        <span className="flex items-center text-yellow-600">
                          <ClockIcon className="h-5 w-5 mr-1" />
                          Pending
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600">
                          <XCircleIcon className="h-5 w-5 mr-1" />
                          Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}