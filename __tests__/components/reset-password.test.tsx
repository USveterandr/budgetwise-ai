// Test for Reset Password Page Component
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import ResetPasswordPage from '../../src/app/auth/reset-password/page';
import * as auth from '../../src/lib/auth';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock auth functions
jest.mock('../../src/lib/auth', () => ({
  verifyPasswordResetToken: jest.fn(),
  resetPassword: jest.fn(),
}));

// Mock useSearchParams to return a token
const mockSearchParams = new Map();
mockSearchParams.set('token', 'test-token');

describe('ResetPasswordPage', () => {
  const mockPush = jest.fn();
  
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => mockSearchParams.get(key),
    });
    jest.clearAllMocks();
  });

  it('should render token verification state initially', async () => {
    // Mock token verification
    (auth.verifyPasswordResetToken as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<ResetPasswordPage />);
    
    expect(screen.getByText('Verifying Reset Link')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we verify your password reset link...')).toBeInTheDocument();
  });

  it('should show error for invalid token', async () => {
    (auth.verifyPasswordResetToken as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'Invalid or expired reset token.'
    });

    render(<ResetPasswordPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid or expired reset token.')).toBeInTheDocument();
      expect(screen.getByText('Request New Reset Link')).toBeInTheDocument();
    });
  });

  it('should show password reset form for valid token', async () => {
    (auth.verifyPasswordResetToken as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'Token is valid.'
    });

    render(<ResetPasswordPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      expect(screen.getByText('Enter your new password below.')).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset Password' })).toBeInTheDocument();
    });
  });

  it('should show error when passwords do not match', async () => {
    (auth.verifyPasswordResetToken as jest.Mock).mockResolvedValueOnce({
      success: true,
    });

    render(<ResetPasswordPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    
    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  it('should show error for weak passwords', async () => {
    (auth.verifyPasswordResetToken as jest.Mock).mockResolvedValueOnce({
      success: true,
    });

    render(<ResetPasswordPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    
    fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'weak' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();
    });
  });

  it('should successfully reset password with valid inputs', async () => {
    (auth.verifyPasswordResetToken as jest.Mock).mockResolvedValueOnce({
      success: true,
    });
    
    (auth.resetPassword as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });

    render(<ResetPasswordPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    
    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(auth.resetPassword).toHaveBeenCalledWith('test-token', 'NewPassword123');
      expect(screen.getByText('Password reset successfully. You can now log in with your new password.')).toBeInTheDocument();
    });
  });

  it('should show error when resetPassword fails', async () => {
    (auth.verifyPasswordResetToken as jest.Mock).mockResolvedValueOnce({
      success: true,
    });
    
    (auth.resetPassword as jest.Mock).mockResolvedValueOnce({
      success: false,
      error: 'Failed to reset password.'
    });

    render(<ResetPasswordPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    
    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to reset password.')).toBeInTheDocument();
    });
  });

  it('should show loading state during password reset', async () => {
    (auth.verifyPasswordResetToken as jest.Mock).mockResolvedValueOnce({
      success: true,
    });
    
    (auth.resetPassword as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    render(<ResetPasswordPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    
    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('Resetting...');
  });

  it('should show success message after successful password reset', async () => {
    (auth.verifyPasswordResetToken as jest.Mock).mockResolvedValueOnce({
      success: true,
    });
    
    (auth.resetPassword as jest.Mock).mockResolvedValueOnce({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });

    render(<ResetPasswordPage />);
    
    await waitFor(() => {
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    const submitButton = screen.getByRole('button', { name: 'Reset Password' });
    
    fireEvent.change(newPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'NewPassword123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Password reset successfully. You can now log in with your new password.')).toBeInTheDocument();
      expect(screen.getByText('Continue to Login')).toBeInTheDocument();
    });
  });

  it('should have a link back to sign in', async () => {
    (auth.verifyPasswordResetToken as jest.Mock).mockResolvedValueOnce({
      success: true,
    });

    render(<ResetPasswordPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Back to Sign In')).toBeInTheDocument();
    });
    
    const signInLink = screen.getByText('Back to Sign In');
    expect(signInLink).toHaveAttribute('href', '/auth/login');
  });
});