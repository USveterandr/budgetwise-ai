from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
import jwt
from decimal import Decimal

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

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
    unlocked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

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
    
    # Hash password and create user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name
    )
    
    user_dict = prepare_for_mongo(user.dict())
    user_dict["password"] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
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

# Dashboard data
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