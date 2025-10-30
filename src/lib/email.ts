// Email utility functions
import { render } from '@react-email/render';
import ConfirmationEmail from '@/emails/confirmation-email';

// Check if we're running on the client side
const isClient = typeof window !== 'undefined';

// Get environment variables (works both on client and server)
const HUBSPOT_API_KEY = isClient 
  ? (window as unknown as { env?: { HUBSPOT_API_KEY?: string } }).env?.HUBSPOT_API_KEY || process.env.NEXT_PUBLIC_HUBSPOT_API_KEY
  : process.env.HUBSPOT_API_KEY;

const HUBSPOT_TEMPLATE_ID = isClient
  ? (window as unknown as { env?: { HUBSPOT_TEMPLATE_ID?: string } }).env?.HUBSPOT_TEMPLATE_ID || process.env.NEXT_PUBLIC_HUBSPOT_TEMPLATE_ID
  : process.env.HUBSPOT_TEMPLATE_ID;

const SENDGRID_API_KEY = isClient
  ? (window as unknown as { env?: { SENDGRID_API_KEY?: string } }).env?.SENDGRID_API_KEY || process.env.NEXT_PUBLIC_SENDGRID_API_KEY
  : process.env.SENDGRID_API_KEY;

// Email utility functions for Cloudflare Email Service

// Send confirmation email
export async function sendConfirmationEmail(email: string, name: string, confirmationToken: string) {
  try {
    // For Cloudflare Email Service, we'll make a request to our own API endpoint
    const response = await fetch('/api/send-confirmation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name,
        confirmationToken
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Failed to send confirmation email' };
  }
}

// Verify email token
export async function verifyEmailToken(token: string) {
  try {
    // Call our database worker to verify the email token
    const response = await fetch(`https://budgetwise-database-worker.isaactrinidadllc.workers.dev/verify-email/${token}`);
    
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      return { success: false, error: result.error || 'Email verification failed' };
    }
    
    return { success: true, message: result.message || 'Email verified successfully' };
  } catch (error) {
    console.error('Email verification error:', error);
    return { success: false, error: 'Network error. Please try again.' };
  }
}
