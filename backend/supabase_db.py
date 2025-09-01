import os
import asyncpg
from datetime import datetime, timezone
from typing import Optional, Dict, Any

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
        "full_name": row["full_name"],
        "subscription_plan": row["subscription_plan"],
        "created_at": row["created_at"],
        "points": row["points"],
        "streak_days": row["streak_days"],
        "last_login": row["last_login"],
        "email_confirmed": row["email_confirmed"],
        "email_confirmation_token": str(row["email_confirmation_token"]) if row["email_confirmation_token"] else None,
        "email_confirmation_sent_at": row["email_confirmation_sent_at"],
        "is_admin": row["is_admin"],
        "password": row["password"],  # hashed
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
                email_confirmation_sent_at, is_admin, password
            ) VALUES (
                gen_random_uuid(), $1, $2, $3, now(), 0,
                0, NULL, $4, $5::uuid,
                $6, $7, $8
            ) RETURNING *
            """,
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
