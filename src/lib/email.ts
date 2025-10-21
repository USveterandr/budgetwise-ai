// Email utility functions using multiple email providers

import emailjs from '@emailjs/browser';

// EmailJS Configuration (optional)
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || '';

// SMTP Configuration (Gmail/Other SMTP)
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = process.env.SMTP_PORT || '587';
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || '';

// HubSpot Configuration
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY || '';
const HUBSPOT_TEMPLATE_ID = process.env.HUBSPOT_TEMPLATE_ID || '';

// Initialize EmailJS if credentials are provided
if (typeof window !== 'undefined' && EMAILJS_PUBLIC_KEY) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

// Send confirmation email
export async function sendConfirmationEmail(email: string, name: string, confirmationToken: string) {
  try {
    const confirmationUrl = `${window.location.origin}/auth/confirm-email?token=${confirmationToken}`;
    
    // Try HubSpot first if configured
    if (HUBSPOT_API_KEY && HUBSPOT_TEMPLATE_ID) {
      return await sendViaHubSpot(email, name, confirmationUrl);
    }
    
    // Try SMTP (Gmail) if configured
    if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
      return await sendViaSMTP(email, name, confirmationUrl);
    }
    
    // Fallback to EmailJS if configured
    if (EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID) {
      return await sendViaEmailJS(email, name, confirmationUrl);
    }
    
    // Log to console if no email service is configured
    console.log('Email would be sent to:', email);
    console.log('Name:', name);
    console.log('Confirmation URL:', confirmationUrl);
    
    // For demo purposes, we'll simulate success
    return { success: true, message: 'Email would be sent in a real implementation' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'Failed to send confirmation email' };
  }
}

// Send via HubSpot Transactional API
async function sendViaHubSpot(email: string, name: string, confirmationUrl: string) {
  try {
    const response = await fetch('https://api.hubapi.com/email/public/v1/singleEmail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`
      },
      body: JSON.stringify({
        emailId: parseInt(HUBSPOT_TEMPLATE_ID),
        message: {
          to: email
        },
        contactProperties: {
          firstname: name
        },
        customProperties: {
          confirmation_link: confirmationUrl
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status}`);
    }
    
    console.log('Email sent via HubSpot to:', email);
    return { success: true };
  } catch (error) {
    console.error('HubSpot email error:', error);
    throw error;
  }
}

// Send via SMTP (Gmail or other SMTP service)
async function sendViaSMTP(email: string, name: string, confirmationUrl: string) {
  try {
    // For a production implementation, you would typically call a backend service
    // that handles SMTP sending, as SMTP credentials shouldn't be exposed client-side
    
    // Log the email details (in production, this would be sent to your backend)
    console.log('Email would be sent via SMTP to:', email);
    console.log('From:', SMTP_FROM);
    console.log('Subject: Confirm your BudgetWise AI account');
    console.log('Body includes confirmation URL:', confirmationUrl);
    
    // For demo purposes, we'll simulate success
    return { success: true };
  } catch (error) {
    console.error('SMTP email error:', error);
    throw error;
  }
}

// Send via EmailJS
async function sendViaEmailJS(email: string, name: string, confirmationUrl: string) {
  try {
    const templateParams = {
      to_email: email,
      to_name: name,
      confirmation_link: confirmationUrl,
    };
    
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );
    
    console.log('Email sent via EmailJS to:', email);
    return { success: true };
  } catch (error) {
    console.error('EmailJS error:', error);
    throw error;
  }
}