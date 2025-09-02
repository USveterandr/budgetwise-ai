import asyncpg
import asyncio

async def test_connection():
    try:
        pool = await asyncpg.create_pool(
            'postgresql://postgres:j5ICbdBqZyvBPljr@db.poceibkkajglqfheygbt.supabase.co:5432/postgres',
            min_size=1,
            max_size=1
        )
        print('Connection successful!')
        
        async with pool.acquire() as conn:
            result = await conn.fetchval('SELECT 1')
            print(f'Query result: {result}')
        
        await pool.close()
        print('Connection closed successfully')
        
    except Exception as e:
        print(f'Connection failed: {e}')
        print(f'Error type: {type(e).__name__}')

if __name__ == '__main__':
    asyncio.run(test_connection())