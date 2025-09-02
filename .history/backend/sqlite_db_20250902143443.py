import sqlite3
import bcrypt
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'budgetwise.db')

def init_database():
    """Initialize the SQLite database with users table"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            subscription_plan TEXT DEFAULT 'free',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            points INTEGER DEFAULT 0,
            streak_days INTEGER DEFAULT 0,
            last_login TIMESTAMP,
            email_confirmed BOOLEAN DEFAULT 1,
            email_confirmation_token TEXT,
            email_confirmation_sent_at TIMESTAMP,
            is_admin BOOLEAN DEFAULT 0,
            is_hold BOOLEAN DEFAULT 0,
            is_paused BOOLEAN DEFAULT 0,
            paused_at TIMESTAMP,
            hold_reason TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

def create_admin_user():
    """Create the admin user if it doesn't exist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if admin user exists
    cursor.execute('SELECT id FROM users WHERE email = ?', ('isaactrinidadllc@gmail.com',))
    if cursor.fetchone():
        print('Admin user already exists')
        conn.close()
        return
    
    # Create admin user
    password_hash = bcrypt.hashpw('SecureAdminPass123!'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    cursor.execute('''
        INSERT INTO users (id, email, password_hash, full_name, is_admin, email_confirmed)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        'admin-user-id',
        'isaactrinidadllc@gmail.com',
        password_hash,
        'Isaac Trinidad',
        1,
        1
    ))
    
    conn.commit()
    conn.close()
    print('Admin user created successfully')

async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users WHERE email = ?', (email.lower(),))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    return {
        'id': row['id'],
        'email': row['email'],
        'full_name': row['full_name'],
        'subscription_plan': row['subscription_plan'],
        'created_at': datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
        'points': row['points'],
        'streak_days': row['streak_days'],
        'last_login': datetime.fromisoformat(row['last_login']) if row['last_login'] else None,
        'email_confirmed': bool(row['email_confirmed']),
        'email_confirmation_token': row['email_confirmation_token'],
        'email_confirmation_sent_at': datetime.fromisoformat(row['email_confirmation_sent_at']) if row['email_confirmation_sent_at'] else None,
        'is_admin': bool(row['is_admin']),
        'is_hold': bool(row['is_hold']),
        'is_paused': bool(row['is_paused']),
        'paused_at': datetime.fromisoformat(row['paused_at']) if row['paused_at'] else None,
        'hold_reason': row['hold_reason'],
        'password': row['password_hash']
    }

async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    return {
        'id': row['id'],
        'email': row['email'],
        'full_name': row['full_name'],
        'subscription_plan': row['subscription_plan'],
        'created_at': datetime.fromisoformat(row['created_at']) if row['created_at'] else None,
        'points': row['points'],
        'streak_days': row['streak_days'],
        'last_login': datetime.fromisoformat(row['last_login']) if row['last_login'] else None,
        'email_confirmed': bool(row['email_confirmed']),
        'email_confirmation_token': row['email_confirmation_token'],
        'email_confirmation_sent_at': datetime.fromisoformat(row['email_confirmation_sent_at']) if row['email_confirmation_sent_at'] else None,
        'is_admin': bool(row['is_admin']),
        'is_hold': bool(row['is_hold']),
        'is_paused': bool(row['is_paused']),
        'paused_at': datetime.fromisoformat(row['paused_at']) if row['paused_at'] else None,
        'hold_reason': row['hold_reason'],
        'password': row['password_hash']
    }

async def set_last_login(user_id: str):
    """Update user's last login time"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        'UPDATE users SET last_login = ? WHERE id = ?',
        (datetime.now(timezone.utc).isoformat(), user_id)
    )
    
    conn.commit()
    conn.close()

async def create_user(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new user"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO users (id, email, password_hash, full_name, subscription_plan, created_at, email_confirmed)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        user_data['id'],
        user_data['email'].lower(),
        user_data['password'],
        user_data['full_name'],
        user_data.get('subscription_plan', 'free'),
        datetime.now(timezone.utc).isoformat(),
        user_data.get('email_confirmed', False)
    ))
    
    conn.commit()
    conn.close()
    
    return user_data

async def update_user_fields(user_id: str, fields: Dict[str, Any]):
    """Update user fields"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Build dynamic update query
    set_clauses = []
    values = []
    
    for field, value in fields.items():
        set_clauses.append(f'{field} = ?')
        if isinstance(value, datetime):
            values.append(value.isoformat())
        else:
            values.append(value)
    
    values.append(user_id)
    
    query = f'UPDATE users SET {', '.join(set_clauses)} WHERE id = ?'
    cursor.execute(query, values)
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_database()
    create_admin_user()
    print('Database initialized successfully')