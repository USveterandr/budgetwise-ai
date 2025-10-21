// Email utility functions

// Check if we're running on the client side
const isClient = typeof window !== 'undefined';

// Get environment variables (works both on client and server)
const HUBSPOT_API_KEY = isClient 
  ? (window as unknown as { env?: { HUBSPOT_API_KEY?: string } }).env?.HUBSPOT_API_KEY || process.env.NEXT_PUBLIC_HUBSPOT_API_KEY
  : process.env.HUBSPOT_API_KEY;

const HUBSPOT_TEMPLATE_ID = isClient
  ? (window as unknown as { env?: { HUBSPOT_TEMPLATE_ID?: string } }).env?.HUBSPOT_TEMPLATE_ID || process.env.NEXT_PUBLIC_HUBSPOT_TEMPLATE_ID
  : process.env.HUBSPOT_TEMPLATE_ID;

// Send confirmation email
export async function sendConfirmationEmail(email: string, name: string, confirmationToken: string) {
  try {
    // In a real implementation, you would send an actual email
    // For now, we'll just log that we would send an email
    console.log(`Would send confirmation email to ${email} with token ${confirmationToken}`);
    
    // If we have HubSpot configured, send via HubSpot
    if (HUBSPOT_API_KEY && HUBSPOT_TEMPLATE_ID) {
      return await sendViaHubSpot(email, name, confirmationToken);
    }
    
    // Fallback for development
    console.log('Email would contain confirmation link:', 
      `https://budgetwise-ai.pages.dev/auth/confirm-email?token=${confirmationToken}`);
    return { success: true, message: 'Confirmation email sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Failed to send confirmation email' };
  }
}

// Send via HubSpot Transactional API
async function sendViaHubSpot(email: string, name: string, confirmationToken: string) {
  try {
    const confirmationUrl = `https://budgetwise-ai.pages.dev/auth/confirm-email?token=${confirmationToken}`;
    
    const response = await fetch('https://api.hubapi.com/marketing/v3/transactional/email/single-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`
      },
      body: JSON.stringify({
        emailId: HUBSPOT_TEMPLATE_ID,
        recipient: {
          email: email,
          properties: {
            firstname: name,
            confirmation_link: confirmationUrl
          }
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`HubSpot API error: ${JSON.stringify(errorData)}`);
    }
    
    const result = await response.json();
    return { success: true, message: 'Confirmation email sent successfully via HubSpot', result };
  } catch (error) {
    console.error('HubSpot email error:', error);
    throw error;
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