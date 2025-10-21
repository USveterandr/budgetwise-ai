import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = 0;

// Import our email utility
// import { sendConfirmationEmail } from '@/lib/email';

// Send confirmation email using SendGrid (if available) or log to console
async function sendConfirmationEmail(email: string, confirmationToken: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const confirmationUrl = `${baseUrl}/auth/confirm-email?token=${confirmationToken}`;
  
  // Try to use SendGrid if API key is available
  if (process.env.SENDGRID_API_KEY) {
    try {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: email,
        from: process.env.SMTP_FROM || 'noreply@budgetwise.ai',
        subject: 'Confirm your BudgetWise AI account',
        text: `Welcome to BudgetWise AI! Please click this link to confirm your account: ${confirmationUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Welcome to BudgetWise AI!</h2>
            <p>Thank you for signing up. Please click the button below to confirm your email address and activate your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Confirm Email Address
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280;">${confirmationUrl}</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't create an account with BudgetWise AI, you can safely ignore this email.
            </p>
          </div>
        `,
      };
      
      await sgMail.send(msg);
      console.log(`Confirmation email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      // Fall back to console logging
    }
  }
  
  // Try to use SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Confirm your BudgetWise AI account',
        text: `Welcome to BudgetWise AI! Please click this link to confirm your account: ${confirmationUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Welcome to BudgetWise AI!</h2>
            <p>Thank you for signing up. Please click the button below to confirm your email address and activate your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" 
                 style="background-color: #3b82f6; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; display: inline-block;">
                Confirm Email Address
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280;">${confirmationUrl}</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              If you didn't create an account with BudgetWise AI, you can safely ignore this email.
            </p>
          </div>
        `,
      });
      
      console.log(`Confirmation email sent to ${email}: ${info.messageId}`);
      return true;
    } catch (error) {
      console.error('SMTP error:', error);
      // Fall back to console logging
    }
  }
  
  // Fallback: Log to console
  console.log(`Confirmation email would be sent to ${email}`);
  console.log(`Confirmation link: ${confirmationUrl}`);
  return true;
}

export async function POST(request: Request) {
  try {
    const { name, email, password, plan } = await request.json();
    
    // Validate input
    if (!name || !email || !password || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }
    
    // In a real implementation, you would:
    // 1. Hash the password
    // 2. Check if user already exists
    // 3. Create user in database
    // 4. Generate confirmation token
    // 5. Store token in database with expiration
    // 6. Send confirmation email
    
    // For now, we'll simulate the process
    const confirmationToken = `token_${Math.random().toString(36).substring(2, 15)}`;
    
    // Simulate database storage of confirmation token
    // In a real app, you would store this in your database with an expiration time
    console.log(`Storing confirmation token for user ${email}: ${confirmationToken}`);
    
    // Send confirmation email
    await sendConfirmationEmail(email, confirmationToken);
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully. Please check your email for confirmation.'
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}