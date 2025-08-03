import React, { useState, useRef, useEffect } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { useBudget } from '../../context/BudgetContext';
import './AIAssistant.css';

const AIAssistant = () => {
  const { transactions } = useTransactions();
  const { budgets } = useBudget();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const commonQuestions = [
    "How much did I spend on groceries last month?",
    "What's my total income this month?",
    "Which category am I overspending on?",
    "How much can I save by canceling unused subscriptions?",
    "What's my current net worth?"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const analyzeSpending = (category, period = 'month') => {
    const now = new Date();
    let startDate;
    
    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const filtered = transactions.filter(t => 
      t.category === category && new Date(t.date) >= startDate
    );
    
    const total = filtered.reduce((sum, t) => sum + t.amount, 0);
    const budget = budgets.find(b => b.category === category);
    
    return {
      total,
      budget: budget?.amount || 0,
      remaining: budget ? budget.amount - total : 0,
      count: filtered.length
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const response = generateResponse(input);
      setMessages(prev => [...prev, { text: response, sender: 'ai' }]);
      setIsLoading(false);
    }, 1000);
  };

  const generateResponse = (query) => {
    query = query.toLowerCase();
    
    // Spending analysis
    if (query.includes('spend') && query.includes('last month')) {
      const categoryMatch = query.match(/on (\w+)/i);
      const category = categoryMatch ? categoryMatch[1].toLowerCase() : null;
      
      if (category) {
        const analysis = analyzeSpending(category);
        return `You spent $${analysis.total.toFixed(2)} on ${category} this month. ` + 
