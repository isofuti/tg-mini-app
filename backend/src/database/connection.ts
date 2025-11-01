import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

export async function connectDatabase(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  // Support both DATABASE_URL (Render, Heroku) and individual env vars (Docker)
  const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'telegram_courses',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      };

  pool = new Pool(poolConfig);

  // Test connection
  try {
    const client = await pool.connect();
    client.release();
    return pool;
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return pool;
}

export async function query(text: string, params?: any[]): Promise<any> {
  const poolInstance = getPool();
  return poolInstance.query(text, params);
}

export async function getClient(): Promise<PoolClient> {
  const poolInstance = getPool();
  return poolInstance.connect();
}

export async function closeDatabaseConnection(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
