import React, { useState, useEffect } from 'react';
import { useBudget } from '../../context/BudgetContext';
import './BudgetManager.css';

const BudgetManager = () => {
  const { budgets, addBudget, updateBudget, deleteBudget } = useBudget();
  const [activeCategory, setActiveCategory] = useState('all');
  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly'
  });

  const categories = [
    { id: 'housing', name: 'Housing' },
