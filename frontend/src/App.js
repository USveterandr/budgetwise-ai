import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Dashboard from "./components/Dashboard";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import ExpenseTracker from "./components/ExpenseTracker";
import BudgetManager from "./components/BudgetManager";
import AchievementsPage from "./components/AchievementsPage";
import InvestmentTracker from "./components/InvestmentTracker";
import { Toaster } from "./components/ui/sonner";

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage setUser={setUser} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/expenses" element={<ExpenseTracker user={user} />} />
          <Route path="/budget" element={<BudgetManager user={user} />} />
          <Route path="/achievements" element={<AchievementsPage user={user} />} />
          <Route path="/investments" element={<InvestmentTracker user={user} />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;