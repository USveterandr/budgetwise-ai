import knex from 'knex';
import { MongoClient } from 'mongodb';
import Redis from 'ioredis';

// PostgreSQL Configuration
export const postgresConfig = {
  client: 'pg',
  connection: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'focusflow',
    user: process.env.POSTGRES_USER || 'focusflow',
    password: process.env.POSTGRES_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  pool: {
    min: parseInt(process.env.POSTGRES_POOL_MIN || '2'),
    max: parseInt(process.env.POSTGRES_POOL_MAX || '10'),
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 10000,
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './seeds',
  },
  debug: process.env.NODE_ENV === 'development',
};

// MongoDB Configuration
export const mongoConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/focusflow',
  options: {
    maxPoolSize: parseInt(process.env.MONGODB_POOL_SIZE || '10'),
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
};

// Redis Configuration
export const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
};

// Database connection singletons
let postgresClient: knex.Knex | null = null;
let mongoClient: MongoClient | null = null;
let redisClient: Redis | null = null;

export const getPostgresClient = (): knex.Knex => {
  if (!postgresClient) {
    postgresClient = knex(postgresConfig);
  }
  return postgresClient;
};

export const getMongoClient = async (): Promise<MongoClient> => {
  if (!mongoClient) {
    mongoClient = new MongoClient(mongoConfig.uri, mongoConfig.options);
    await mongoClient.connect();
  }
  return mongoClient;
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    redisClient = new Redis(redisConfig);
  }
  return redisClient;
};

// Graceful shutdown
export const closeConnections = async (): Promise<void> => {
  if (postgresClient) {
    await postgresClient.destroy();
    postgresClient = null;
  }
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

// Health check
export const checkDatabaseHealth = async (): Promise<{
  postgres: boolean;
  mongodb: boolean;
  redis: boolean;
}> => {
  const health = {
    postgres: false,
    mongodb: false,
    redis: false,
  };

  try {
    const pg = getPostgresClient();
    await pg.raw('SELECT 1');
    health.postgres = true;
  } catch (error) {
    console.error('PostgreSQL health check failed:', error);
  }

  try {
    const mongo = await getMongoClient();
    await mongo.db().admin().ping();
    health.mongodb = true;
  } catch (error) {
    console.error('MongoDB health check failed:', error);
  }

  try {
    const redis = getRedisClient();
    await redis.ping();
    health.redis = true;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  return health;
};

export default {
  getPostgresClient,
  getMongoClient,
  getRedisClient,
  closeConnections,
  checkDatabaseHealth,
};
