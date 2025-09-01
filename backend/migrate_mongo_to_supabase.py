#!/usr/bin/env python3
import os
import asyncio
from datetime import datetime

from motor.motor_asyncio import AsyncIOMotorClient
import asyncpg


async def migrate():
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    pg_url = os.environ.get('SUPABASE_DB_URL')

    if not mongo_url or not db_name or not pg_url:
        print('Set MONGO_URL, DB_NAME, SUPABASE_DB_URL')
        return

    mclient = AsyncIOMotorClient(mongo_url)
    mdb = mclient[db_name]
    pg = await asyncpg.connect(dsn=pg_url)

    # Users
    users = await mdb.users.find({}).to_list(length=100000)
    print(f"Migrating {len(users)} users...")
    for u in users:
        email = u.get('email','').lower()
        if not email:
            continue
        exists = await pg.fetchrow('select id from public.users where email=$1', email)
        if exists:
            continue
        await pg.execute(
            '''insert into public.users (
                id,email,full_name,subscription_plan,created_at,points,streak_days,last_login,
                email_confirmed,email_confirmation_token,email_confirmation_sent_at,is_admin,password
            ) values (
                gen_random_uuid(), $1, $2, coalesce($3,'free'), coalesce($4, now()), coalesce($5,0), coalesce($6,0), $7,
                coalesce($8,false), $9::uuid, $10, coalesce($11,false), $12
            )''',
            email,
            u.get('full_name') or email.split('@')[0],
            u.get('subscription_plan','free'),
            u.get('created_at'),
            u.get('points',0),
            u.get('streak_days',0),
            u.get('last_login'),
            u.get('email_confirmed', False),
            u.get('email_confirmation_token'),
            u.get('email_confirmation_sent_at'),
            u.get('is_admin', False),
            u.get('password'),
        )

    # Build email->id map
    rows = await pg.fetch('select id,email from public.users')
    id_by_email = {r['email']: str(r['id']) for r in rows}

    # Budgets
    budgets = await mdb.budgets.find({}).to_list(length=100000)
    print(f"Migrating {len(budgets)} budgets...")
    for b in budgets:
        email = None
        # If you have user->email inverse, otherwise rely on user_id match later
        user_id = b.get('user_id')
        if not user_id:
            continue
        # We expect user ids to differ; we map by email only if needed. If you store email in Mongo budgets, map here.
        # For now, try to find Supabase user by joining via users collection
        user_doc = await mdb.users.find_one({ 'id': user_id })
        if not user_doc:
            continue
        sb_user_id = id_by_email.get(user_doc.get('email','').lower())
        if not sb_user_id:
            continue
        await pg.execute(
            '''insert into public.budgets (id,user_id,category,amount,period,spent,created_at)
               values (gen_random_uuid(), $1::uuid, $2, $3, coalesce($4,'monthly'), coalesce($5,0), coalesce($6, now()))''',
            sb_user_id, b.get('category'), float(b.get('amount',0) or 0), b.get('period','monthly'), float(b.get('spent',0) or 0), b.get('created_at'),
        )

    # Expenses
    expenses = await mdb.expenses.find({}).to_list(length=100000)
    print(f"Migrating {len(expenses)} expenses...")
    for e in expenses:
        user_id = e.get('user_id')
        if not user_id:
            continue
        user_doc = await mdb.users.find_one({ 'id': user_id })
        if not user_doc:
            continue
        sb_user_id = id_by_email.get(user_doc.get('email','').lower())
        if not sb_user_id:
            continue
        await pg.execute(
            '''insert into public.expenses (id,user_id,amount,category,description,date,created_at)
               values (gen_random_uuid(), $1::uuid, $2, $3, $4, coalesce($5, now()), coalesce($6, now()))''',
            sb_user_id, float(e.get('amount',0) or 0), e.get('category'), e.get('description'), e.get('date'), e.get('created_at'),
        )

    await pg.close()
    mclient.close()
    print('Migration complete.')


if __name__ == '__main__':
    asyncio.run(migrate())
