import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

/* global test, expect */

test('renders BudgetWise AI heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/BudgetWise AI/i);
  expect(headingElement).toBeInTheDocument();
});
