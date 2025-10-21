// Test for Forgot Password Page Component
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import ForgotPasswordPage from '../../src/app/auth/forgot-password/page';
import * as auth from '../../src/lib/auth';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth functions
jest.mock('../../src/lib/auth', () => ({
  requestPasswordReset: jest.fn(),
}));

describe('ForgotPasswordPage', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    jest.clearAllMocks();
  });

  it('should render the forgot password form', () => {
    render(<ForgotPasswordPage />);
    
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByText('Enter your email address and we\'ll send you a link to reset your password.')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
  });

  it('should show error message when requestPasswordReset fails', async () => {
    (auth.requestPasswordReset as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'Failed to request password reset.'
    });

    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to request password reset.')).toBeInTheDocument();
    });
  });

  it('should show success message when requestPasswordReset succeeds', async () => {
    (auth.requestPasswordReset as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'If an account exists with that email, you will receive a password reset link shortly.'
    });

    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('If an account exists with that email, you will receive a password reset link shortly.')).toBeInTheDocument();
    });
  });

  it('should show loading state during request', async () => {
    (auth.requestPasswordReset as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Sending...');
  });

  it('should have a link back to sign in', () => {
    render(<ForgotPasswordPage />);
    
    const signInLink = screen.getByText('Sign in');
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/auth/login');
  });

  it('should require email field to submit form', async () => {
    (auth.requestPasswordReset as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'If an account exists with that email, you will receive a password reset link shortly.'
    });

    render(<ForgotPasswordPage />);
    
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    
    fireEvent.click(submitButton);
    
    // Form should not submit if email is empty
    expect(auth.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('should handle network errors gracefully', async () => {
    (auth.requestPasswordReset as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'Network error. Please try again.'
    });

    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
    });
  });

  it('should clear messages when resubmitting', async () => {
    (auth.requestPasswordReset as jest.Mock)
      .mockResolvedValueOnce({
        success: true,
        message: 'If an account exists with that email, you will receive a password reset link shortly.'
      })
      .mockResolvedValueOnce({
        success: false,
        error: 'Failed to request password reset.'
      });

    render(<ForgotPasswordPage />);
    
    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });
    
    // First submission - success
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('If an account exists with that email, you will receive a password reset link shortly.')).toBeInTheDocument();
    });
    
    // Second submission - error
    fireEvent.change(emailInput, { target: { value: 'another@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to request password reset.')).toBeInTheDocument();
      expect(screen.queryByText('If an account exists with that email, you will receive a password reset link shortly.')).not.toBeInTheDocument();
    });
  });
});