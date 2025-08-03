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
               (analysis.budget ? `This is ${(analysis.total/analysis.budget*100).toFixed(0)}% of your $${analysis.budget.toFixed(2)} budget.` : '');
      }
    }

    // Budget analysis
    if (query.includes('overspend') || query.includes('over budget')) {
      const overBudgets = budgets.filter(b => {
        const spent = transactions
          .filter(t => t.category === b.category)
          .reduce((sum, t) => sum + t.amount, 0);
        return spent > b.amount;
      });

      if (overBudgets.length > 0) {
        return `You're over budget in: ` + 
          overBudgets.map(b => {
            const spent = transactions
              .filter(t => t.category === b.category)
              .reduce((sum, t) => sum + t.amount, 0);
            return `${b.category} ($${spent.toFixed(2)} of $${b.amount.toFixed(2)})`;
          }).join(', ');
      } else {
        return 'You\'re not over budget in any categories! Great job!';
      }
    }

    // Default responses
    const defaultResponses = [
      "I've analyzed your financial data and can provide insights.",
      "Would you like me to generate a report on your spending patterns?",
      "I can help you identify areas where you could save money.",
      "Based on your transactions, I can offer personalized recommendations."
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
  };

  return (
    <div className="ai-assistant">
      <div className="chat-header">
        <h2>Budgetwise AI Assistant</h2>
        <p>Ask me anything about your finances</p>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="message ai">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-questions">
          <h4>Common Questions:</h4>
          {commonQuestions.map((q, i) => (
            <button 
              key={i} 
              className="quick-question"
              onClick={() => handleQuickQuestion(q)}
            >
              {q}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your finances..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? '...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
