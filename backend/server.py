from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
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

# PayPal SDK imports
from paypalcheckoutsdk.core import SandboxEnvironment, LiveEnvironment
from paypalcheckoutsdk.core import PayPalHttpClient
from paypalcheckoutsdk.orders import OrdersCreateRequest, OrdersCaptureRequest
from paypalcheckoutsdk.payments import CapturesRefundRequest

# Email imports
from emails import send_confirmation_email, send_welcome_email, send_password_reset_email, EmailDeliveryError

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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
        
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

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
        email_confirmation_sent_at=datetime.now(timezone.utc)
    )
    
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
async def login(login_data: UserLogin):
    # Find user
    user_doc = await db.users.find_one({"email": login_data.email})
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not verify_password(login_data.password, user_doc["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login and streak
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

# Gamification routes
@api_router.get("/gamification/achievements")
async def get_user_achievements(current_user: User = Depends(get_current_user)):
    """Get all user achievements"""
    achievements = await db.achievements.find({"user_id": current_user.id}).to_list(length=1000)
    return [Achievement(**parse_from_mongo(achievement)) for achievement in achievements]

@api_router.get("/gamification/leaderboard")
async def get_leaderboard(limit: int = 10):
    """Get top users by points"""
    pipeline = [
        {"$sort": {"points": -1}},
        {"$limit": limit},
        {"$project": {"full_name": 1, "points": 1, "streak_days": 1}}
    ]
    leaderboard = await db.users.aggregate(pipeline).to_list(length=limit)
    return leaderboard

@api_router.get("/gamification/challenges")
async def get_active_challenges(current_user: User = Depends(get_current_user)):
    """Get active challenges for user"""
    # Get active global challenges
    active_challenges = await db.challenges.find({"is_active": True}).to_list(length=1000)
    
    # Get user's progress on challenges
    user_challenges = await db.user_challenges.find({"user_id": current_user.id}).to_list(length=1000)
    user_progress = {uc["challenge_id"]: uc for uc in user_challenges}
    
    # Combine challenge data with user progress
    challenges_with_progress = []
    for challenge in active_challenges:
        challenge_data = Challenge(**parse_from_mongo(challenge))
        progress = user_progress.get(challenge["id"], {"current_progress": 0.0, "is_completed": False})
        
        challenges_with_progress.append({
            **challenge_data.dict(),
            "user_progress": progress.get("current_progress", 0.0),
            "is_completed": progress.get("is_completed", False)
        })
    
    return challenges_with_progress

@api_router.post("/gamification/check-achievements")
async def check_achievements(current_user: User = Depends(get_current_user)):
    """Manually check and award new achievements"""
    new_achievements = await check_and_award_achievements(current_user.id)
    await update_user_streak(current_user.id)
    
    return {
        "new_achievements": new_achievements,
        "message": f"Found {len(new_achievements)} new achievements!"
    }

@api_router.get("/gamification/stats")
async def get_user_gamification_stats(current_user: User = Depends(get_current_user)):
    """Get comprehensive gamification stats for user"""
    # Get updated user data
    user_doc = await db.users.find_one({"id": current_user.id})
    
    # Get achievement counts by category
    achievements = await db.achievements.find({"user_id": current_user.id}).to_list(length=1000)
    achievement_categories = {}
    total_achievements = len(achievements)
    
    for achievement in achievements:
        category = achievement.get("category", "general")
        achievement_categories[category] = achievement_categories.get(category, 0) + 1
    
    # Get challenge completion stats
    completed_challenges = await db.user_challenges.count_documents({
        "user_id": current_user.id,
        "is_completed": True
    })
    
    # Calculate user rank
    users_with_fewer_points = await db.users.count_documents({"points": {"$lt": user_doc.get("points", 0)}})
    user_rank = users_with_fewer_points + 1
    
    return {
        "points": user_doc.get("points", 0),
        "streak_days": user_doc.get("streak_days", 0),
        "total_achievements": total_achievements,
        "achievement_categories": achievement_categories,
        "completed_challenges": completed_challenges,
        "user_rank": user_rank,
        "level": max(1, user_doc.get("points", 0) // 100),  # Level up every 100 points
        "points_to_next_level": 100 - (user_doc.get("points", 0) % 100)
    }

# Expense routes
@api_router.post("/expenses", response_model=Expense)
async def create_expense(expense_data: ExpenseCreate, current_user: User = Depends(get_current_user)):
    expense_dict = expense_data.dict()
    if expense_dict.get('date') is None:
        expense_dict['date'] = datetime.now(timezone.utc)
    
    expense = Expense(
        user_id=current_user.id,
        **expense_dict
    )
    
    expense_dict = prepare_for_mongo(expense.dict())
    await db.expenses.insert_one(expense_dict)
    
    # Update budget spent amount if budget exists
    budget = await db.budgets.find_one({
        "user_id": current_user.id,
        "category": expense.category
    })
    if budget:
        await db.budgets.update_one(
            {"id": budget["id"]},
            {"$inc": {"spent": expense.amount}}
        )
    
    # Check for new achievements
    await check_and_award_achievements(current_user.id)
    await update_user_streak(current_user.id)
    
    return expense

@api_router.get("/expenses", response_model=List[Expense])
async def get_expenses(current_user: User = Depends(get_current_user)):
    expenses = await db.expenses.find({"user_id": current_user.id}).to_list(length=1000)
    return [Expense(**parse_from_mongo(expense)) for expense in expenses]

# Budget routes
@api_router.post("/budgets", response_model=Budget)
async def create_budget(budget_data: BudgetCreate, current_user: User = Depends(get_current_user)):
    # Calculate current spent for this category
    expenses = await db.expenses.find({
        "user_id": current_user.id,
        "category": budget_data.category
    }).to_list(length=1000)
    
    total_spent = sum(expense.get("amount", 0) for expense in expenses)
    
    budget = Budget(
        user_id=current_user.id,
        spent=total_spent,
        **budget_data.dict()
    )
    
    budget_dict = prepare_for_mongo(budget.dict())
    await db.budgets.insert_one(budget_dict)
    
    return budget

@api_router.get("/budgets", response_model=List[Budget])
async def get_budgets(current_user: User = Depends(get_current_user)):
    budgets = await db.budgets.find({"user_id": current_user.id}).to_list(length=1000)
    return [Budget(**parse_from_mongo(budget)) for budget in budgets]

# Achievement routes
@api_router.get("/achievements", response_model=List[Achievement])
async def get_achievements(current_user: User = Depends(get_current_user)):
    achievements = await db.achievements.find({"user_id": current_user.id}).to_list(length=1000)
    return [Achievement(**parse_from_mongo(achievement)) for achievement in achievements]

# Investment routes
@api_router.post("/investments", response_model=Investment)
async def create_investment(investment_data: InvestmentCreate, current_user: User = Depends(get_current_user)):
    investment = Investment(
        user_id=current_user.id,
        current_price=investment_data.purchase_price,  # Initial current price
        **investment_data.dict()
    )
    
    investment_dict = prepare_for_mongo(investment.dict())
    await db.investments.insert_one(investment_dict)
    
    return investment

@api_router.get("/investments", response_model=List[Investment])
async def get_investments(current_user: User = Depends(get_current_user)):
    investments = await db.investments.find({"user_id": current_user.id}).to_list(length=1000)
    return [Investment(**parse_from_mongo(investment)) for investment in investments]

# PayPal Payment Routes
@api_router.post("/payments/create-order")
async def create_payment_order(payment_data: PaymentIntent, current_user: User = Depends(get_current_user)):
    try:
        request = OrdersCreateRequest()
        request.prefer('return=representation')
        
        # Plan pricing mapping
        plan_pricing = {
            "free": 0,
            "personal-plus": 9.99,
            "investor": 19.99,
            "business-pro-elite": 49.99
        }
        
        amount = plan_pricing.get(payment_data.plan_id, payment_data.amount)
        
        request.request_body = {
            "intent": "CAPTURE",
            "application_context": {
                "brand_name": "BudgetWise",
                "landing_page": "BILLING",
                "shipping_preference": "NO_SHIPPING",
                "user_action": "PAY_NOW",
                "return_url": f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/payment/success",
                "cancel_url": f"{os.environ.get('FRONTEND_URL', 'http://localhost:3000')}/payment/cancel"
            },
            "purchase_units": [{
                "reference_id": f"user_{current_user.id}_plan_{payment_data.plan_id}",
                "amount": {
                    "currency_code": payment_data.currency,
                    "value": f"{amount:.2f}"
                },
                "description": f"BudgetWise {payment_data.plan_id.replace('-', ' ').title()} Subscription"
            }]
        }
        
        response = paypal_client.execute(request)
        
        # Store pending payment in database
        payment_record = {
            "id": str(uuid.uuid4()),
            "user_id": current_user.id,
            "paypal_order_id": response.result.id,
            "plan_id": payment_data.plan_id,
            "amount": amount,
            "currency": payment_data.currency,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.payments.insert_one(prepare_for_mongo(payment_record))
        
        return {
            "order_id": response.result.id,
            "status": response.result.status,
            "links": [{"href": link.href, "rel": link.rel, "method": link.method} for link in response.result.links]
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment order creation failed: {str(e)}")

@api_router.post("/payments/capture-order")
async def capture_payment_order(capture_data: PaymentCapture, current_user: User = Depends(get_current_user)):
    try:
        request = OrdersCaptureRequest(capture_data.order_id)
        response = paypal_client.execute(request)
        
        if response.result.status == "COMPLETED":
            # Update payment record
            await db.payments.update_one(
                {"paypal_order_id": capture_data.order_id},
                {"$set": {
                    "status": "completed",
                    "captured_at": datetime.now(timezone.utc).isoformat(),
                    "paypal_capture_id": response.result.purchase_units[0].payments.captures[0].id
                }}
            )
            
            # Get payment record to update user subscription
            payment_record = await db.payments.find_one({"paypal_order_id": capture_data.order_id})
            
            if payment_record:
                # Update user's subscription plan
                await db.users.update_one(
                    {"id": current_user.id},
                    {"$set": {"subscription_plan": payment_record["plan_id"]}}
                )
                
                # Create subscription record
                subscription = {
                    "id": str(uuid.uuid4()),
                    "user_id": current_user.id,
                    "plan_id": payment_record["plan_id"],
                    "status": "active",
                    "amount": payment_record["amount"],
                    "currency": payment_record["currency"],
                    "billing_cycle": "monthly",
                    "next_billing_date": (datetime.now(timezone.utc) + timezone.timedelta(days=30)).isoformat(),
                    "paypal_order_id": capture_data.order_id,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                
                await db.subscriptions.insert_one(prepare_for_mongo(subscription))
        
        return {
            "capture_id": response.result.purchase_units[0].payments.captures[0].id,
            "status": response.result.status,
            "amount": response.result.purchase_units[0].payments.captures[0].amount
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Payment capture failed: {str(e)}")

@api_router.get("/payments/plans")
async def get_subscription_plans():
    return {
        "plans": [
            {
                "id": "free",
                "name": "Free",
                "price": 0,
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
    client.close()