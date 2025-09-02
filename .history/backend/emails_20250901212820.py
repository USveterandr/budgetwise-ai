from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
import os
from typing import Optional
import logging
import uuid
from datetime import datetime, timezone, timedelta
import ssl
import certifi

logger = logging.getLogger(__name__)

class EmailDeliveryError(Exception):
    pass

def send_email(to: str, subject: str, content: str, content_type: str = "html"):
    """
    Send email via SendGrid
    
    Args:
        to: Recipient email address
        subject: Email subject line
        content: Email content (HTML or plain text)
        content_type: "html" or "plain"
    """
    message = Mail(
        from_email=os.getenv('SENDER_EMAIL'),
        to_emails=to,
        subject=subject,
        html_content=content if content_type == "html" else None,
        plain_text_content=content if content_type == "plain" else None
    )
    
    try:
        # Configure SSL context to use system certificates
        ssl_context = ssl.create_default_context(cafile=certifi.where())
        
        # Create SendGrid client with proper SSL context
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        
        # Set SSL context for the underlying HTTP client
        if hasattr(sg.client, 'session'):
            sg.client.session.verify = certifi.where()
        
        response = sg.send(message)
        logger.info(f"Email sent successfully to {to}, status: {response.status_code}")
        return response.status_code == 202
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {str(e)}")
        raise EmailDeliveryError(f"Failed to send email: {str(e)}")

def send_confirmation_email(user_email: str, user_name: str, confirmation_token: str, base_url: str = "https://smart-finance-dash-2.preview.emergentagent.com"):
    """
    Send email confirmation for new user registration
    """
    confirmation_url = f"{base_url}/#/confirm-email?token={confirmation_token}"
    
    subject = "Welcome to BudgetWise - Confirm Your Email"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to BudgetWise</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f8f9fa;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
            }}
            .logo {{
                font-size: 28px;
                font-weight: bold;
                margin-bottom: 10px;
            }}
            .content {{
                padding: 40px 30px;
            }}
            .welcome-text {{
                font-size: 24px;
                color: #1f2937;
                margin-bottom: 20px;
                font-weight: 600;
            }}
            .description {{
                color: #6b7280;
                margin-bottom: 30px;
                font-size: 16px;
            }}
            .confirm-button {{
                display: inline-block;
                background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
                transition: transform 0.2s;
            }}
            .confirm-button:hover {{
                transform: translateY(-2px);
            }}
            .features {{
                background-color: #f9fafb;
                padding: 30px;
                margin: 30px 0;
                border-radius: 8px;
            }}
            .feature-item {{
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                color: #374151;
            }}
            .feature-icon {{
                width: 20px;
                height: 20px;
                background-color: #10b981;
                border-radius: 50%;
                margin-right: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
            }}
            .footer {{
                background-color: #f9fafb;
                padding: 30px;
                text-align: center;
                color: #6b7280;
                font-size: 14px;
            }}
            .alt-link {{
                color: #6b7280;
                font-size: 14px;
                margin-top: 20px;
                padding: 15px;
                background-color: #f9fafb;
                border-radius: 6px;
                word-break: break-all;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🐷 BudgetWise</div>
                <p style="margin: 0; opacity: 0.9;">Your Financial Freedom Starts Here</p>
            </div>
            
            <div class="content">
                <h1 class="welcome-text">Welcome to BudgetWise, {user_name}! 🎉</h1>
                
                <p class="description">
                    You're one step away from taking control of your finances. Click the button below to confirm your email address and unlock the full BudgetWise experience.
                </p>
                
                <div style="text-align: center;">
                    <a href="{confirmation_url}" class="confirm-button">
                        Confirm Email Address
                    </a>
                </div>
                
                <div class="features">
                    <h3 style="color: #1f2937; margin-bottom: 20px;">What awaits you:</h3>
                    <div class="feature-item">
                        <div class="feature-icon">✓</div>
                        <span>Smart expense tracking with AI categorization</span>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">✓</div>
                        <span>Gamified budgeting with achievements and rewards</span>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">✓</div>
                        <span>Investment portfolio monitoring</span>
                    </div>
                    <div class="feature-item">
                        <div class="feature-icon">✓</div>
                        <span>Personalized financial insights and recommendations</span>
                    </div>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    If the button above doesn't work, copy and paste this link into your browser:
                </p>
                <div class="alt-link">{confirmation_url}</div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                    This confirmation link will expire in 24 hours for security reasons.
                </p>
            </div>
            
            <div class="footer">
                <p>Thanks for choosing BudgetWise!</p>
                <p>If you didn't sign up for BudgetWise, you can safely ignore this email.</p>
                <p style="margin-top: 20px;">
                    <strong>BudgetWise Team</strong><br>
                    Transforming Financial Futures
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(user_email, subject, html_content, "html")

def send_welcome_email(user_email: str, user_name: str, subscription_plan: str = "free"):
    """
    Send welcome email after successful email confirmation
    """
    subject = f"🎉 Welcome to BudgetWise {subscription_plan.replace('-', ' ').title()} Plan!"
    
    plan_features = {
        "free": [
            "Basic expense tracking",
            "Simple budget creation",
            "Monthly reports",
            "Mobile app access"
        ],
        "personal-plus": [
            "Advanced budgeting tools",
            "AI-powered insights",
            "Unlimited categories",
            "Goal tracking",
            "Achievement system",
            "Priority support"
        ],
        "investor": [
            "Everything in Personal Plus",
            "Investment portfolio tracking", 
            "Retirement planning tools",
            "Advanced analytics",
            "Tax optimization tips",
            "Financial advisor consultation"
        ],
        "business-pro-elite": [
            "Everything in Investor",
            "Team collaboration",
            "Business expense management",
            "Advanced reporting",
            "API access",
            "Dedicated account manager"
        ]
    }
    
    features = plan_features.get(subscription_plan, plan_features["free"])
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to BudgetWise</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f8f9fa;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
            }}
            .content {{
                padding: 40px 30px;
            }}
            .plan-badge {{
                display: inline-block;
                background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 20px;
            }}
            .cta-button {{
                display: inline-block;
                background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Welcome to BudgetWise!</h1>
                <p>Your financial journey begins now</p>
            </div>
            
            <div class="content">
                <div class="plan-badge">{subscription_plan.replace('-', ' ').title()} Plan</div>
                
                <h2>Hello {user_name},</h2>
                
                <p>Congratulations! Your email has been confirmed and your BudgetWise account is now active.</p>
                
                <h3>Your {subscription_plan.replace('-', ' ').title()} Plan includes:</h3>
                <ul>
                    {"".join([f"<li>{feature}</li>" for feature in features])}
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://smart-finance-dash-2.preview.emergentagent.com/dashboard" class="cta-button">
                        Start Managing Your Finances
                    </a>
                </div>
                
                <p>Ready to transform your financial future? Log in to your dashboard and start tracking your expenses, creating budgets, and achieving your financial goals!</p>
                
                <p style="margin-top: 30px; color: #6b7280;">
                    Best regards,<br>
                    <strong>The BudgetWise Team</strong>
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(user_email, subject, html_content, "html")

def send_password_reset_email(user_email: str, user_name: str, reset_token: str, base_url: str = "https://smart-finance-dash-2.preview.emergentagent.com"):
    """
    Send password reset email
    """
    reset_url = f"{base_url}/#/reset-password?token={reset_token}"
    
    subject = "Reset Your BudgetWise Password"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f8f9fa;
            }}
            .container {{
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }}
            .header {{
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                padding: 40px 20px;
                text-align: center;
            }}
            .content {{
                padding: 40px 30px;
            }}
            .reset-button {{
                display: inline-block;
                background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                color: white;
                padding: 16px 32px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset Request</h1>
                <p>BudgetWise Account Security</p>
            </div>
            
            <div class="content">
                <h2>Hello {user_name},</h2>
                
                <p>We received a request to reset your BudgetWise account password. Click the button below to set a new password:</p>
                
                <div style="text-align: center;">
                    <a href="{reset_url}" class="reset-button">
                        Reset Password
                    </a>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                    If the button above doesn't work, copy and paste this link into your browser:
                </p>
                <div style="color: #6b7280; font-size: 14px; padding: 15px; background-color: #f9fafb; border-radius: 6px; word-break: break-all;">
                    {reset_url}
                </div>
                
                <p style="color: #ef4444; font-size: 14px; margin-top: 20px;">
                    ⏰ This reset link will expire in 1 hour for security reasons.
                </p>
                
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
                </p>
                
                <p style="margin-top: 30px; color: #6b7280;">
                    Best regards,<br>
                    <strong>The BudgetWise Security Team</strong>
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(user_email, subject, html_content, "html")