import os
import asyncpg
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

_pool: Optional[asyncpg.Pool] = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        db_url = os.environ.get("SUPABASE_DB_URL")
        if not db_url:
            raise RuntimeError("SUPABASE_DB_URL is not set")
        _pool = await asyncpg.create_pool(dsn=db_url, min_size=1, max_size=5)
    return _pool


def _row_to_user(row: asyncpg.Record) -> Dict[str, Any]:
    if not row:
        return None
    return {
        "id": str(row["id"]),
        "email": row["email"],
        "full_name": row["full_name"] if row["full_name"] else "",
        "subscription_plan": row["subscription_plan"] if row["subscription_plan"] else "free",
        "created_at": row["created_at"],
        "points": row["points"] if row["points"] is not None else 0,
        "streak_days": row["streak_days"] if row["streak_days"] is not None else 0,
        "last_login": row["last_login"],
        "email_confirmed": row["email_confirmed"] if row["email_confirmed"] is not None else True,
        "email_confirmation_token": row["email_confirmation_token"],
        "email_confirmation_sent_at": row["email_confirmation_sent_at"],
        "is_admin": row["is_admin"],
        "password": row["password_hash"],  # hashed
    }


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM public.users WHERE email = $1", email.lower()
        )
        return _row_to_user(row)


async def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM public.users WHERE id = $1::uuid", user_id
        )
        return _row_to_user(row)


async def create_user(user: Dict[str, Any]) -> Dict[str, Any]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO public.users (
                id, email, full_name, subscription_plan, created_at, points,
                streak_days, last_login, email_confirmed, email_confirmation_token,
                email_confirmation_sent_at, is_admin, password_hash
            ) VALUES (
                $1::uuid, $2, $3, $4, now(), 0,
                0, NULL, $5, $6::uuid,
                $7, $8, $9
            ) RETURNING *
            """,
            user["id"],
            user["email"].lower(),
            user["full_name"],
            user.get("subscription_plan", "free"),
            bool(user.get("email_confirmed", False)),
            user.get("email_confirmation_token"),
            user.get("email_confirmation_sent_at"),
            bool(user.get("is_admin", False)),
            user["password"],
        )
        return _row_to_user(row)


async def update_user_fields(user_id: str, fields: Dict[str, Any]) -> None:
    if not fields:
        return
    pool = await get_pool()
    keys = []
    values = []
    idx = 1
    for k, v in fields.items():
        keys.append(f"{k} = ${idx}")
        values.append(v)
        idx += 1
    values.append(user_id)
    set_clause = ", ".join(keys)
    query = f"UPDATE public.users SET {set_clause} WHERE id = ${idx}::uuid"
    async with (await get_pool()).acquire() as conn:
        await conn.execute(query, *values)


async def set_last_login(user_id: str) -> None:
    await update_user_fields(user_id, {"last_login": datetime.now(timezone.utc)})


# ---------------- Budgets ----------------
async def get_budgets_by_user(user_id: str) -> List[Dict[str, Any]]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM public.budgets WHERE user_id = $1::uuid ORDER BY created_at DESC",
            user_id,
        )
        return [dict(r) for r in rows]


async def find_budget_by_user_and_category(user_id: str, category: str) -> Optional[Dict[str, Any]]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM public.budgets WHERE user_id = $1::uuid AND category = $2",
            user_id, category,
        )
        return dict(row) if row else None


async def inc_budget_spent(budget_id: str, amount: float) -> None:
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE public.budgets SET spent = COALESCE(spent,0) + $1 WHERE id = $2::uuid",
            amount, budget_id,
        )


# ---------------- Expenses ----------------
async def insert_expense(expense: Dict[str, Any]) -> Dict[str, Any]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO public.expenses (
              id, user_id, amount, category, description, date, created_at
            ) VALUES (
              gen_random_uuid(), $1::uuid, $2, $3, $4, $5, now()
            ) RETURNING *
            """,
            expense["user_id"], expense["amount"], expense["category"],
            expense.get("description"), expense.get("date", datetime.now(timezone.utc)),
        )
        return dict(row)


async def get_recent_expenses(user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT * FROM public.expenses
            WHERE user_id = $1::uuid
            ORDER BY created_at DESC
            LIMIT $2
            """,
            user_id, limit,
        )
        return [dict(r) for r in rows]


async def sum_monthly_expenses(user_id: str, start_dt: datetime) -> float:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT COALESCE(SUM(amount),0) AS total FROM public.expenses WHERE user_id = $1::uuid AND date >= $2",
            user_id, start_dt,
        )
        return float(row["total"] or 0.0)


async def count_expenses(user_id: str) -> int:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT COUNT(1) AS c FROM public.expenses WHERE user_id = $1::uuid",
            user_id,
        )
        return int(row["c"]) if row else 0


async def count_budgets(user_id: str) -> int:
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT COUNT(1) AS c FROM public.budgets WHERE user_id = $1::uuid",
            user_id,
        )
        return int(row["c"]) if row else 0
