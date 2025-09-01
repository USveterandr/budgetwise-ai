from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import shutil
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import aiofiles
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from decimal import Decimal
import io
import csv

# PayPal SDK imports
from paypalcheckoutsdk.core import SandboxEnvironment, LiveEnvironment
from paypalcheckoutsdk.core import PayPalHttpClient
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
from paypalcheckoutsdk.payments import CapturesRefundRequest

# Email imports
from emails import send_confirmation_email, send_welcome_email, send_password_reset_email, EmailDeliveryError

# Gemini (Google GenAI) imports
try:
    from google import genai as google_genai
    from google.genai import types as genai_types
except Exception:
    google_genai = None
    genai_types = None

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
USE_SUPABASE = os.environ.get('USE_SUPABASE', '0') in ('1', 'true', 'True')

# MongoDB connection
if not USE_SUPABASE:
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
else:
    from supabase_db import get_user_by_email as sb_get_user_by_email, create_user as sb_create_user, update_user_fields as sb_update_user_fields, set_last_login as sb_set_last_login, get_user_by_id as sb_get_user_by_id

# PayPal Configuration
paypal_client_id = os.environ.get('PAYPAL_CLIENT_ID')
paypal_client_secret = os.environ.get('PAYPAL_CLIENT_SECRET')
paypal_mode = os.environ.get('PAYPAL_MODE', 'sandbox')

# Initialize PayPal client
if paypal_mode == 'live':
    paypal_environment = LiveEnvironment(client_id=paypal_client_id, client_secret=paypal_client_secret)
else:
    paypal_environment = SandboxEnvironment(client_id=paypal_client_id, client_secret=paypal_client_secret)

paypal_client = PayPalHttpClient(paypal_environment)

# Create the main app without a prefix
app = FastAPI(title="BudgetWise API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-here')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL')

# Helper functions
def prepare_for_mongo(data):
    """Convert data for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

def parse_from_mongo(item):
    """Parse data from MongoDB"""
    if isinstance(item, dict):
        for key, value in item.items():
            if isinstance(value, str) and 'T' in value:
                try:
                    item[key] = datetime.fromisoformat(value.replace('Z', '+00:00'))
                except:
                    pass
    return item

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    subscription_plan: str = "free"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    points: int = 0
    streak_days: int = 0
    last_login: Optional[datetime] = None
    email_confirmed: bool = False
    email_confirmation_token: Optional[str] = None
    email_confirmation_sent_at: Optional[datetime] = None
    is_admin: bool = False

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    subscription_plan: str = "free"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Expense(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    category: str
    description: Optional[str] = None
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ExpenseCreate(BaseModel):
    amount: float
    category: str
    description: Optional[str] = None
    date: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

class Budget(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    category: str
    amount: float
    period: str = "monthly"  # weekly, monthly, yearly
    spent: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BudgetCreate(BaseModel):
    category: str
    amount: float
    period: str = "monthly"

class Achievement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    description: str
    points: int
    icon: str
    category: str = "general"  # general, budgeting, expenses, investments, savings
    unlocked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_unlocked: bool = False

class Challenge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    target_value: float
    current_value: float = 0.0
    points_reward: int
    badge_icon: str
    duration_days: int = 7  # Weekly challenges by default
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc) + timedelta(days=7))
    is_active: bool = True

class UserChallenge(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    challenge_id: str
    current_progress: float = 0.0
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    points_earned: int = 0

class Investment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str
    symbol: str
    shares: float
    purchase_price: float
    current_price: float = 0.0
    purchase_date: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InvestmentCreate(BaseModel):
    name: str
    symbol: str
    shares: float
    purchase_price: float
    purchase_date: datetime

class PaymentIntent(BaseModel):
    plan_id: str
    amount: float
    currency: str = "USD"

class PaymentCapture(BaseModel):
    order_id: str
    user_id: str

class Subscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    plan_id: str
    status: str = "active"  # active, canceled, expired
    paypal_subscription_id: Optional[str] = None
    amount: float
    currency: str = "USD"
    billing_cycle: str = "monthly"
    next_billing_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubscriptionCreate(BaseModel):
    plan_id: str
    payment_method: str = "paypal"

class EmailConfirmation(BaseModel):
    token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str

class Receipt(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    filename: str
    file_path: str
    file_type: str  # image, pdf
    file_size: int
    expense_id: Optional[str] = None  # Link to expense if processed
    amount_extracted: Optional[float] = None
    merchant_extracted: Optional[str] = None
    date_extracted: Optional[datetime] = None
    is_processed: bool = False
    uploaded_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class FileUploadResponse(BaseModel):
    receipt_id: str
    filename: str
    file_type: str
    file_size: int
    message: str

# Authentication functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(user_id: str) -> str:
    payload = {"user_id": user_id, "exp": datetime.now(timezone.utc).timestamp() + 86400}  # 24 hours
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        if USE_SUPABASE:
            user = await sb_get_user_by_id(user_id)
        else:
            user = await db.users.find_one({"id": user_id})
        
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**{k: v for k, v in user.items() if k != "password"})
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def admin_required(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# Gamification functions
async def check_and_award_achievements(user_id: str):
    """Check for new achievements and award them"""
    user_doc = await db.users.find_one({"id": user_id})
    if not user_doc:
        return
    
    # Get user's existing achievements
    existing_achievements = await db.achievements.find({"user_id": user_id}).to_list(length=1000)
    existing_titles = {ach.get("title") for ach in existing_achievements}
    
    # Get user's stats for achievement checking
    if USE_SUPABASE:
        from supabase_db import count_expenses as sb_count_expenses, count_budgets as sb_count_budgets
        expenses_count = await sb_count_expenses(user_id)
        budgets_count = await sb_count_budgets(user_id)
    else:
        expenses_count = await db.expenses.count_documents({"user_id": user_id})
        budgets_count = await db.budgets.count_documents({"user_id": user_id})
    investments_count = await db.investments.count_documents({"user_id": user_id})
    
    # Define achievements to check
    potential_achievements = [
        {
            "title": "First Steps",
            "description": "Created your first expense",
            "points": 10,
            "icon": "👶",
            "category": "expenses",
            "condition": expenses_count >= 1
        },
        {
            "title": "Expense Tracker",
            "description": "Added 10 expenses",
            "points": 50,
            "icon": "📝",
            "category": "expenses", 
            "condition": expenses_count >= 10
        },
        {
            "title": "Budget Master",
            "description": "Created your first budget",
            "points": 25,
            "icon": "🎯",
            "category": "budgeting",
            "condition": budgets_count >= 1
        },
        {
            "title": "Investment Guru",
            "description": "Started tracking investments",
            "points": 50,
            "icon": "📈",
            "category": "investments",
            "condition": investments_count >= 1
        },
        {
            "title": "Week Warrior",
            "description": "Used BudgetWise for 7 days",
            "points": 100,
            "icon": "🔥",
            "category": "general",
            "condition": user_doc.get("streak_days", 0) >= 7
        },
        {
            "title": "Month Champion",
            "description": "Used BudgetWise for 30 days",
            "points": 500,
            "icon": "👑",
            "category": "general",
            "condition": user_doc.get("streak_days", 0) >= 30
        }
    ]
    
    # Award new achievements
    points_awarded = 0
    new_achievements = []
    
    for achievement_data in potential_achievements:
        if achievement_data["condition"] and achievement_data["title"] not in existing_titles:
            achievement = Achievement(
                user_id=user_id,
                title=achievement_data["title"],
                description=achievement_data["description"],
                points=achievement_data["points"],
                icon=achievement_data["icon"],
                category=achievement_data["category"],
                is_unlocked=True
            )
            
            achievement_dict = prepare_for_mongo(achievement.dict())
            await db.achievements.insert_one(achievement_dict)
            
            points_awarded += achievement_data["points"]
            new_achievements.append(achievement)
    
    # Update user points
    if points_awarded > 0:
        await db.users.update_one(
            {"id": user_id},
            {"$inc": {"points": points_awarded}}
        )
    
    return new_achievements

async def update_user_streak(user_id: str):
    """Update user's daily streak"""
    user_doc = await db.users.find_one({"id": user_id})
    if not user_doc:
        return
    
    last_login = user_doc.get("last_login")
    current_date = datetime.now(timezone.utc).date()
    
    if last_login:
        if isinstance(last_login, str):
            last_login_date = datetime.fromisoformat(last_login.replace('Z', '+00:00')).date()
        else:
            last_login_date = last_login.date()
        
        if last_login_date == current_date:
            # Already logged in today
            return
        elif last_login_date == current_date - timedelta(days=1):
            # Consecutive day - increment streak
            new_streak = user_doc.get("streak_days", 0) + 1
        else:
            # Streak broken - reset to 1
            new_streak = 1
    else:
        # First login
        new_streak = 1
    
    await db.users.update_one(
        {"id": user_id},
        {
            "$set": {
                "last_login": datetime.now(timezone.utc).isoformat(),
                "streak_days": new_streak
            }
        }
    )

async def create_weekly_challenges():
    """Create weekly challenges for all users"""
    # Sample weekly challenges
    weekly_challenges = [
        {
            "title": "Expense Tracker Champion",
            "description": "Add 15 expenses this week",
            "category": "expenses",
            "target_value": 15,
            "points_reward": 100,
            "badge_icon": "🏆"
        },
        {
            "title": "Budget Keeper",
            "description": "Stay under budget in 3 categories", 
            "category": "budgeting",
            "target_value": 3,
            "points_reward": 150,
            "badge_icon": "💰"
        },
        {
            "title": "Savings Goal",
            "description": "Save $500 this week",
            "category": "savings",
            "target_value": 500,
            "points_reward": 200,
            "badge_icon": "🎯"
        }
    ]
    
    # Create challenges in database
    for challenge_data in weekly_challenges:
        challenge = Challenge(**challenge_data)
        challenge_dict = prepare_for_mongo(challenge.dict())
        await db.challenges.insert_one(challenge_dict)

# Routes
@api_router.get("/")
async def root():
    return {"message": "BudgetWise API is running"}

@api_router.post("/auth/signup")
async def signup(user_data: UserCreate):
    # Check if user already exists
    if USE_SUPABASE:
        existing_user = await sb_get_user_by_email(user_data.email)
    else:
        existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate email confirmation token
    confirmation_token = str(uuid.uuid4())
    
    # Hash password and create user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        subscription_plan=user_data.subscription_plan,
        email_confirmed=False,
        email_confirmation_token=confirmation_token,
        email_confirmation_sent_at=datetime.now(timezone.utc),
        is_admin=(ADMIN_EMAIL is not None and user_data.email.lower() == ADMIN_EMAIL.lower())
    )
    
    if USE_SUPABASE:
        await sb_create_user({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "subscription_plan": user.subscription_plan,
            "email_confirmed": False,
            "email_confirmation_token": confirmation_token,
            "email_confirmation_sent_at": datetime.now(timezone.utc),
            "is_admin": (ADMIN_EMAIL is not None and user.email.lower() == ADMIN_EMAIL.lower()),
            "password_hash": hashed_password,
        })
    else:
        user_dict = prepare_for_mongo(user.dict())
        user_dict["password"] = hashed_password
        await db.users.insert_one(user_dict)
    
    # Send confirmation email
    try:
        send_confirmation_email(user.email, user.full_name, confirmation_token)
    except EmailDeliveryError as e:
        logger.error(f"Failed to send confirmation email to {user.email}: {str(e)}")
        # Continue with registration even if email fails
    
    # Create access token (user can still use app but with limited features until confirmed)
    access_token = create_access_token(user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
        "message": "Account created successfully! Please check your email to confirm your account."
    }

@api_router.post("/auth/login")
async def wrangler_auth_token_DaWRQpM5c4XN0hyDNWvzijkgAByMTGA5eTtl108_login(login_data: UserLogin):
    # Find user
    if USE_SUPABASE:
        user_doc = await sb_get_user_by_email(login_data.email)
    else:
        user_doc = await db.users.find_one({"email": login_data.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(login_data.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Bootstrap admin if matches ADMIN_EMAIL
    if ADMIN_EMAIL and login_data.email.lower() == ADMIN_EMAIL.lower() and not user_doc.get("is_admin", False):
        if USE_SUPABASE:
            await sb_update_user_fields(user_doc["id"], {"is_admin": True})
            user_doc["is_admin"] = True
        else:
            await db.users.update_one({"id": user_doc["id"]}, {"$set": {"is_admin": True}})
            user_doc["is_admin"] = True

    # Update last login and streak
    if USE_SUPABASE:
        await sb_set_last_login(user_doc["id"])
    else:
        await db.users.update_one(
            {"id": user_doc["id"]},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )
    user = User(**{k: v for k, v in user_doc.items() if k != "password"})
    
    # Create access token
    access_token = create_access_token(user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/confirm-email")
async def confirm_email(confirmation_data: EmailConfirmation):
    # Find user with this confirmation token
    user_doc = await db.users.find_one({"email_confirmation_token": confirmation_data.token})
    if not user_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired confirmation token")
    
    # Check if token is not expired (24 hours)
    if user_doc.get("email_confirmation_sent_at"):
        sent_at = datetime.fromisoformat(user_doc["email_confirmation_sent_at"].replace('Z', '+00:00'))
        if datetime.now(timezone.utc) - sent_at > timedelta(hours=24):
            raise HTTPException(status_code=400, detail="Confirmation token has expired")
    
    # Update user as confirmed
    await db.users.update_one(
        {"id": user_doc["id"]},
        {
            "$set": {
                "email_confirmed": True,
                "email_confirmation_token": None
            }
        }
    )
    
    # Send welcome email
    try:
        send_welcome_email(
            user_doc["email"], 
            user_doc["full_name"], 
            user_doc.get("subscription_plan", "free")
        )
    except EmailDeliveryError as e:
        logger.error(f"Failed to send welcome email to {user_doc['email']}: {str(e)}")
    
    return {"message": "Email confirmed successfully! Welcome to BudgetWise!"}

@api_router.post("/auth/resend-confirmation")
async def resend_confirmation_email(current_user: User = Depends(get_current_user)):
    if current_user.email_confirmed:
        raise HTTPException(status_code=400, detail="Email is already confirmed")
    
    # Generate new confirmation token
    confirmation_token = str(uuid.uuid4())
    
    # Update user with new token
    await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {
                "email_confirmation_token": confirmation_token,
                "email_confirmation_sent_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Send confirmation email
    try:
        send_confirmation_email(current_user.email, current_user.full_name, confirmation_token)
        return {"message": "Confirmation email sent successfully!"}
    except EmailDeliveryError as e:
        raise HTTPException(status_code=500, detail="Failed to send confirmation email")

@api_router.post("/auth/request-password-reset")
async def request_password_reset(reset_request: PasswordResetRequest):
    # Find user by email
    user_doc = await db.users.find_one({"email": reset_request.email})
    if not user_doc:
        # Don't reveal if email exists or not for security
        return {"message": "If the email exists, a password reset link has been sent."}
    
    # Generate reset token
    reset_token = str(uuid.uuid4())
    reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # Store reset token in database
    await db.users.update_one(
        {"id": user_doc["id"]},
        {
            "$set": {
                "password_reset_token": reset_token,
                "password_reset_expires": reset_expires.isoformat()
            }
        }
    )
    
    # Send reset email
    try:
        send_password_reset_email(user_doc["email"], user_doc["full_name"], reset_token)
    except EmailDeliveryError as e:
        logger.error(f"Failed to send password reset email to {user_doc['email']}: {str(e)}")
    
    return {"message": "If the email exists, a password reset link has been sent."}

@api_router.post("/auth/reset-password")
async def reset_password(reset_data: PasswordReset):
    # Find user with this reset token
    user_doc = await db.users.find_one({"password_reset_token": reset_data.token})
    if not user_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    # Check if token is not expired
    if user_doc.get("password_reset_expires"):
        expires_at = datetime.fromisoformat(user_doc["password_reset_expires"].replace('Z', '+00:00'))
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Hash new password and update user
    hashed_password = hash_password(reset_data.new_password)
    await db.users.update_one(
        {"id": user_doc["id"]},
        {
            "$set": {
                "password": hashed_password
            },
            "$unset": {
                "password_reset_token": "",
                "password_reset_expires": ""
            }
        }
    )
    
    return {"message": "Password reset successfully!"}

# -------------------- Admin APIs --------------------
class AdminUserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    subscription_plan: str = "free"
    is_admin: bool = False

@api_router.get("/admin/users")
async def admin_list_users(
    page: int = 1,
    page_size: int = 20,
    q: Optional[str] = None,
    plan: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    _: User = Depends(admin_required)
):
    filters = {}
    if q:
        filters["email"] = {"$regex": q, "$options": "i"}
    if plan:
        filters["subscription_plan"] = plan
    if date_from:
        filters["created_at"] = {"$gte": datetime.fromisoformat(date_from).isoformat()}
    if date_to:
        filters.setdefault("created_at", {})["$lte"] = datetime.fromisoformat(date_to).isoformat()

    total = await db.users.count_documents(filters)
    cursor = db.users.find(filters).sort("created_at", -1).skip((page - 1) * page_size).limit(page_size)
    items_raw = await cursor.to_list(length=page_size)
    items = [User(**parse_from_mongo(u)) for u in items_raw]
    return {"total": total, "page": page, "page_size": page_size, "items": items}

@api_router.post("/admin/users")
async def admin_create_user(payload: AdminUserCreate, _: User = Depends(admin_required)):
    # prevent duplicates
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    # build user
    user = User(
        email=payload.email,
        full_name=payload.full_name,
        subscription_plan=payload.subscription_plan,
        email_confirmed=True,  # admin-created users are confirmed
        is_admin=payload.is_admin
    )
    user_doc = prepare_for_mongo(user.dict())
    user_doc["password"] = hash_password(payload.password)
    await db.users.insert_one(user_doc)
    return user

@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, _: User = Depends(admin_required)):
    user_doc = await db.users.find_one({"id": user_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    # delete related data (best-effort)
    await db.expenses.delete_many({"user_id": user_id})
    await db.budgets.delete_many({"user_id": user_id})
    await db.investments.delete_many({"user_id": user_id})
    await db.achievements.delete_many({"user_id": user_id})
    await db.receipts.delete_many({"user_id": user_id})
    await db.user_challenges.delete_many({"user_id": user_id})
    await db.budget_documents.delete_many({"user_id": user_id})
    await db.users.delete_one({"id": user_id})
    return {"message": "User and related data deleted"}

@api_router.get("/admin/reports/summary")
async def admin_reports_summary(_: User = Depends(admin_required)):
    now = datetime.now(timezone.utc)
    seven_ago = now - timedelta(days=7)
    thirty_ago = now - timedelta(days=30)

    total_users = await db.users.count_documents({})

    # counts by plan
    plans = ["free", "personal-plus", "investor", "business-pro-elite"]
    by_plan = {}
    for p in plans:
        by_plan[p] = await db.users.count_documents({"subscription_plan": p})

    # signups last 7 and 30 days (daily buckets)
    async def count_by_day(start: datetime, days: int):
        # fetch users created since start
        users = await db.users.find({"created_at": {"$gte": start.isoformat()}}).to_list(length=10000)
        buckets = {}
        for i in range(days):
            d = (start + timedelta(days=i)).date().isoformat()
            buckets[d] = 0
        for u in users:
            created = u.get("created_at")
            if created:
                if isinstance(created, str):
                    try:
                        d = datetime.fromisoformat(created.replace('Z', '+00:00')).date().isoformat()
                    except:
                        continue
                else:
                    d = created.date().isoformat()
                if d in buckets:
                    buckets[d] += 1
        return buckets

    last7 = await count_by_day((now - timedelta(days=6)).replace(hour=0, minute=0, second=0, microsecond=0), 7)
    last30 = await count_by_day((now - timedelta(days=29)).replace(hour=0, minute=0, second=0, microsecond=0), 30)

    # active users
    active_24h = await db.users.count_documents({"last_login": {"$gte": (now - timedelta(hours=24)).isoformat()}})
    active_7d = await db.users.count_documents({"last_login": {"$gte": seven_ago.isoformat()}})
    active_30d = await db.users.count_documents({"last_login": {"$gte": thirty_ago.isoformat()}})

    return {
        "totals": {
            "users": total_users,
            "by_plan": by_plan
        },
        "signups": {
            "last_7_days": last7,
            "last_30_days": last30
        },
        "active": {
            "last_24h": active_24h,
            "last_7d": active_7d,
            "last_30d": active_30d
        }
    }

@api_router.get("/admin/reports/exports/users.csv")
async def export_users_csv(_: User = Depends(admin_required)):
    users = await db.users.find({}).sort("created_at", -1).to_list(length=100000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "email", "full_name", "subscription_plan", "is_admin", "created_at", "last_login", "email_confirmed"])
    for u in users:
        writer.writerow([
            u.get("id"),
            u.get("email"),
            u.get("full_name"),
            u.get("subscription_plan"),
            u.get("is_admin", False),
            u.get("created_at"),
            u.get("last_login"),
            u.get("email_confirmed", False),
        ])
    csv_bytes = output.getvalue().encode('utf-8')
    headers = {"Content-Disposition": "attachment; filename=users.csv"}
    return Response(content=csv_bytes, media_type="text/csv", headers=headers)

# File upload routes
@api_router.post("/uploads/receipt", response_model=FileUploadResponse)
async def upload_receipt(
    current_user: User = Depends(get_current_user),
    file: UploadFile = File(...),
    description: Optional[str] = Form(None)
):
    """Upload receipt image or PDF for expense tracking"""
    
    # Validate file type
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.pdf', '.heic', '.webp'}
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail="Invalid file type. Allowed: JPG, PNG, PDF, HEIC, WEBP"
        )
    
    # Validate file size (max 10MB)
    max_file_size = 10 * 1024 * 1024  # 10MB in bytes
    file_content = await file.read()
    if len(file_content) > max_file_size:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB"
        )
    
    # Create uploads directory if it doesn't exist
    upload_dir = Path("/app/uploads/receipts")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    receipt_id = str(uuid.uuid4())
    safe_filename = f"{receipt_id}_{file.filename}"
    file_path = upload_dir / safe_filename
    
    # Save file
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Determine file type
    file_type = "pdf" if file_extension == ".pdf" else "image"
    
    # Create receipt record
    receipt = Receipt(
        id=receipt_id,
        user_id=current_user.id,
        filename=file.filename,
        file_path=str(file_path),
        file_type=file_type,
        file_size=len(file_content)
    )
    
    receipt_dict = prepare_for_mongo(receipt.dict())
    await db.receipts.insert_one(receipt_dict)
    
    return FileUploadResponse(
        receipt_id=receipt_id,
        filename=file.filename,
        file_type=file_type,
        file_size=len(file_content),
        message="Receipt uploaded successfully! You can now create an expense from it."
    )

@api_router.get("/uploads/receipts")
async def get_user_receipts(current_user: User = Depends(get_current_user)):
    """Get all receipts uploaded by the user"""
    receipts = await db.receipts.find({"user_id": current_user.id}).sort("uploaded_at", -1).to_list(length=1000)
    return [Receipt(**parse_from_mongo(receipt)) for receipt in receipts]

@api_router.get("/uploads/receipt/{receipt_id}/file")
async def get_receipt_file(receipt_id: str, current_user: User = Depends(get_current_user)):
    """Download receipt file"""
    receipt_doc = await db.receipts.find_one({"id": receipt_id, "user_id": current_user.id})
    if not receipt_doc:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    file_path = Path(receipt_doc["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        path=str(file_path),
        filename=receipt_doc["filename"],
        media_type="application/octet-stream"
    )

@api_router.post("/uploads/receipt/{receipt_id}/create-expense")
async def create_expense_from_receipt(
    receipt_id: str,
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_user)
):
    """Create an expense from an uploaded receipt"""
    # Verify receipt belongs to user
    receipt_doc = await db.receipts.find_one({"id": receipt_id, "user_id": current_user.id})
    if not receipt_doc:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    # Create expense
    expense = Expense(
        user_id=current_user.id,
        **expense_data.dict()
    )
    
    if USE_SUPABASE:
        from supabase_db import insert_expense as sb_insert_expense, find_budget_by_user_and_category as sb_find_budget_by_user_and_category, inc_budget_spent as sb_inc_budget_spent
        inserted = await sb_insert_expense(expense.dict())
    else:
        expense_dict = prepare_for_mongo(expense.dict())
        await db.expenses.insert_one(expense_dict)
    
    # Link receipt to expense
    await db.receipts.update_one(
        {"id": receipt_id},
        {
            "$set": {
                "expense_id": expense.id,
                "is_processed": True,
                "amount_extracted": expense_data.amount
            }
        }
    )
    
    # Update budget if exists
    if USE_SUPABASE:
        budget = await sb_find_budget_by_user_and_category(current_user.id, expense.category)
        if budget:
            await sb_inc_budget_spent(budget["id"], expense.amount)
    else:
        budget = await db.budgets.find_one({
            "user_id": current_user.id,
            "category": expense.category
        })
        if budget:
            await db.budgets.update_one(
                {"id": budget["id"]},
                {"$inc": {"spent": expense.amount}}
            )
    
    # Check achievements
    await check_and_award_achievements(current_user.id)
    
    return {
        "expense": expense,
        "message": "Expense created successfully from receipt!"
    }

@api_router.delete("/uploads/receipt/{receipt_id}")
async def delete_receipt(receipt_id: str, current_user: User = Depends(get_current_user)):
    """Delete a receipt and its file"""
    receipt_doc = await db.receipts.find_one({"id": receipt_id, "user_id": current_user.id})
    if not receipt_doc:
        raise HTTPException(status_code=404, detail="Receipt not found")
    
    # Delete file from disk
    file_path = Path(receipt_doc["file_path"])
    try:
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        logger.error(f"Failed to delete file {file_path}: {str(e)}")
    
    # Delete from database
    await db.receipts.delete_one({"id": receipt_id})
    
    return {"message": "Receipt deleted successfully"}

# Budget document upload
@api_router.post("/uploads/budget-document")
async def upload_budget_document(
    current_user: User = Depends(get_current_user),
    file: UploadFile = File(...),
    document_type: str = Form(...),  # bank_statement, budget_plan, financial_report
    description: Optional[str] = Form(None)
):
    """Upload budget-related documents (PDFs, bank statements, etc.)"""
    
    # Validate file type - allow more document types
    allowed_extensions = {'.pdf', '.xlsx', '.xls', '.csv', '.png', '.jpg', '.jpeg'}
    file_extension = Path(file.filename).suffix.lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Allowed: PDF, Excel, CSV, JPG, PNG"
        )
    
    # Validate file size (max 20MB for documents)
    max_file_size = 20 * 1024 * 1024  # 20MB
    file_content = await file.read()
    if len(file_content) > max_file_size:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 20MB"
        )
    
    # Create uploads directory
    upload_dir = Path("/app/uploads/documents")
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate unique filename
    document_id = str(uuid.uuid4())
    safe_filename = f"{document_id}_{file.filename}"
    file_path = upload_dir / safe_filename
    
    # Save file
    try:
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Create document record
    document = {
        "id": document_id,
        "user_id": current_user.id,
        "filename": file.filename,
        "file_path": str(file_path),
        "file_type": file_extension.lstrip('.'),
        "file_size": len(file_content),
        "document_type": document_type,
        "description": description,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.budget_documents.insert_one(prepare_for_mongo(document))
    
    return {
        "document_id": document_id,
        "filename": file.filename,
        "file_type": file_extension.lstrip('.'),
        "file_size": len(file_content),
        "document_type": document_type,
        "message": "Document uploaded successfully!"
    }

@api_router.get("/uploads/budget-documents")
async def get_budget_documents(current_user: User = Depends(get_current_user)):
    """Get all budget documents uploaded by user"""
    documents = await db.budget_documents.find(
        {"user_id": current_user.id}
    ).sort("uploaded_at", -1).to_list(length=1000)
    
    return documents

# ============== AI: Gemini-powered extraction & summarization ==============

def _get_gemini_client():
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not configured in backend environment")
    if google_genai is None or genai_types is None:
        raise HTTPException(status_code=500, detail="Gemini SDK not installed on backend")
    try:
        client = google_genai.Client(api_key=api_key)
        return client
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize Gemini client: {str(e)}")


def _strip_code_fences(text: str) -> str:
    if text is None:
        return ""
    t = text.strip()
    if t.startswith("```") and t.endswith("```"):
        # remove first line with possible language hint
        lines = t.splitlines()
        if len(lines) >= 3:
            return "\n".join(lines[1:-1])
    return t


@api_router.post("/ai/receipt/extract")
async def ai_extract_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Use Gemini to extract structured data from a receipt image/PDF"""
    # Validate size (10MB)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 10MB")
    
    client = _get_gemini_client()
    mime = file.content_type or "application/octet-stream"

    prompt = (
        "Analyze this receipt and return ONLY valid JSON with these fields: "
        "{\"amount\": float|null, \"merchant\": string|null, \"date\": YYYY-MM-DD|string|null, "
        "\"category\": string|null (one of grocery, restaurant, retail, gas, pharmacy, entertainment, other), "
        "\"items\": [{\"name\": string, \"price\": float, \"quantity\": int}], \"confidence\": float between 0 and 1}. "
        "No extra commentary."
    )

    try:
        part = genai_types.Part.from_bytes(data=content, mime_type=mime)
        resp = await app.state.loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[part, prompt],
                config=genai_types.GenerateContentConfig(
                    max_output_tokens=1500,
                    temperature=0.1,
                    response_mime_type="application/json"
                )
            )
        )
        text = _strip_code_fences(getattr(resp, 'text', '') or '')
        import json as _json
        try:
            data = _json.loads(text)
        except Exception:
            # try best-effort cleanup
            cleaned = text.strip()
            if cleaned.startswith('{') and cleaned.endswith('}'):
                data = _json.loads(cleaned)
            else:
                raise
        return {
            "status": "success",
            "filename": file.filename,
            "content_type": mime,
            "extracted_data": data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Gemini receipt extraction error: {str(e)}")
        raise HTTPException(status_code=500, detail="AI extraction failed")


@api_router.post("/ai/bank-statement/summarize")
async def ai_summarize_bank_statement(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Use Gemini to summarize a bank statement PDF/Image"""
    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 20MB")
    
    client = _get_gemini_client()
    mime = file.content_type or "application/pdf"

    prompt = (
        "Summarize this bank statement and return ONLY valid JSON with fields: "
        "{\"period_start\": YYYY-MM-DD|null, \"period_end\": YYYY-MM-DD|null, \"opening_balance\": float|null, "
        "\"closing_balance\": float|null, \"total_deposits\": float|null, \"total_withdrawals\": float|null, "
        "\"transaction_count\": int, \"largest_deposit\": float|null, \"largest_withdrawal\": float|null, "
        "\"categories\": {string: float}, \"confidence\": float between 0 and 1}. No extra text."
    )

    try:
        part = genai_types.Part.from_bytes(data=content, mime_type=mime)
        resp = await app.state.loop.run_in_executor(
            None,
            lambda: client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[part, prompt],
                config=genai_types.GenerateContentConfig(
                    max_output_tokens=2000,
                    temperature=0.1,
                    response_mime_type="application/json"
                )
            )
        )
        text = _strip_code_fences(getattr(resp, 'text', '') or '')
        import json as _json
        data = _json.loads(text)
        return {
            "status": "success",
            "filename": file.filename,
            "content_type": mime,
            "summary": data
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Gemini statement summarize error: {str(e)}")
        raise HTTPException(status_code=500, detail="AI summarization failed")

# ============================ Payments & Plans =============================
@api_router.get("/payments/plans")
async def get_subscription_plans():
    return {
        "plans": [
            {
                "id": "free",
                "name": "Free",
                "price": 0.0,
                "currency": "USD",
                "billing_cycle": "monthly",
                "features": [
                    "Basic expense tracking",
                    "Simple budget creation",
                    "Monthly reports",
                    "Mobile app access"
                ]
            },
            {
                "id": "personal-plus",
                "name": "Personal Plus",
                "price": 9.99,
                "currency": "USD",
                "billing_cycle": "monthly",
                "features": [
                    "Advanced budgeting tools",
                    "AI-powered insights",
                    "Unlimited categories",
                    "Goal tracking",
                    "Achievement system",
                    "Priority support"
                ]
            },
            {
                "id": "investor",
                "name": "Investor",
                "price": 19.99,
                "currency": "USD",
                "billing_cycle": "monthly",
                "features": [
                    "Everything in Personal Plus",
                    "Investment portfolio tracking",
                    "Retirement planning tools",
                    "Advanced analytics",
                    "Tax optimization tips",
                    "Financial advisor consultation"
                ]
            },
            {
                "id": "business-pro-elite",
                "name": "Business Pro Elite",
                "price": 49.99,
                "currency": "USD",
                "billing_cycle": "monthly",
                "features": [
                    "Everything in Investor",
                    "Team collaboration",
                    "Business expense management",
                    "Advanced reporting",
                    "API access",
                    "Dedicated account manager"
                ]
            }
        ]
    }

@api_router.get("/payments/subscription")
async def get_user_subscription(current_user: User = Depends(get_current_user)):
    subscription = await db.subscriptions.find_one({"user_id": current_user.id, "status": "active"})
    if subscription:
        return Subscription(**parse_from_mongo(subscription))
    return None

@api_router.get("/dashboard")
async def get_dashboard_data(current_user: User = Depends(get_current_user)):
    # Get recent expenses
    if USE_SUPABASE:
        from supabase_db import get_recent_expenses as sb_get_recent_expenses, get_budgets_by_user as sb_get_budgets_by_user, sum_monthly_expenses as sb_sum_monthly_expenses
        recent_expenses_rows = await sb_get_recent_expenses(current_user.id, 5)
        recent_expenses = [Expense(**row) for row in recent_expenses_rows]
        budgets_rows = await sb_get_budgets_by_user(current_user.id)
        budgets = [Budget(**row) for row in budgets_rows]
        current_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        total_spent_this_month = await sb_sum_monthly_expenses(current_user.id, current_month)
    else:
        recent_expenses = await db.expenses.find(
            {"user_id": current_user.id}
        ).sort("created_at", -1).limit(5).to_list(length=5)
        
        # Get budgets with progress
        budgets = await db.budgets.find({"user_id": current_user.id}).to_list(length=1000)
        
        # Calculate total expenses this month
        current_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        monthly_expenses = await db.expenses.find({
            "user_id": current_user.id,
            "date": {"$gte": current_month.isoformat()}
        }).to_list(length=1000)
        
        total_spent_this_month = sum(expense.get("amount", 0) for expense in monthly_expenses)
    
    # Get achievements count
    achievements_count = await db.achievements.count_documents({"user_id": current_user.id})
    
    return {
        "user": current_user,
        "recent_expenses": [Expense(**parse_from_mongo(exp)) for exp in recent_expenses],
        "budgets": [Budget(**parse_from_mongo(budget)) for budget in budgets],
        "total_spent_this_month": total_spent_this_month,
        "achievements_count": achievements_count
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    if not USE_SUPABASE:
        client.close()

# For Cloudflare Worker
worker_app = app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)