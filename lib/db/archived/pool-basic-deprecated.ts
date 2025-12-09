/**
 * Database Connection Pool
 * Manages PostgreSQL connections with automatic retry and health checks
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import type { DatabaseConfig, TransactionCallback, QueryParams } from '../../database/types';
import { dbLogger } from '@/lib/utils/logger';

class DatabasePool {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private isInitialized = false;

  constructor() {
    this.config = this.getConfig();
  }

  /**
   * Get database configuration from environment
   * SECURITY FIX: Enforce SSL in production with proper certificate validation
   */
  private getConfig(): DatabaseConfig {
    const connectionString = process.env.DATABASE_URL;
    const isProduction = process.env.NODE_ENV === 'production';

    // SECURITY: Determine SSL configuration based on environment
    let sslConfig: boolean | { rejectUnauthorized: boolean; ca?: string } = false;

    if (isProduction) {
      // PRODUCTION: Enforce SSL with certificate validation
      sslConfig = {
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA, // Optional CA certificate
      };
      dbLogger.info('Database SSL enabled with certificate validation (production)');
    } else if (process.env.DB_SSL === 'true') {
      // DEVELOPMENT: Allow self-signed certificates
      sslConfig = { rejectUnauthorized: false };
      dbLogger.warn('Database SSL enabled without certificate validation (development only)');
    }

    if (connectionString) {
      // Validate production requirements
      if (isProduction && !connectionString.includes('sslmode=')) {
        dbLogger.warn('DATABASE_URL should include sslmode=require in production');
      }

      return {
        connectionString,
        max: parseInt(process.env.DB_POOL_MAX || '20', 10),
        idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
        connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '2000', 10),
        ssl: sslConfig,
      };
    }

    // Fallback to individual connection parameters
    const config: DatabaseConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'hablas',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '2000', 10),
      ssl: sslConfig,
    };

    // Validate production configuration
    if (isProduction) {
      if (!config.password) {
        throw new Error('CRITICAL: Database password must be set in production');
      }
      if (config.ssl === false || !config.ssl) {
        throw new Error('CRITICAL: Database SSL must be enabled in production');
      }
    }

    return config;
  }

  /**
   * Initialize the connection pool
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.pool = new Pool(this.config);

    // Set up error handler
    this.pool.on('error', (err) => {
      dbLogger.error('Unexpected error on idle client', err);
    });

    // Test connection
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isInitialized = true;
      dbLogger.info('Database connection pool initialized');
    } catch (error) {
      dbLogger.error('Failed to initialize database pool', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  /**
   * Get the pool instance (initialize if needed)
   */
  async getPool(): Promise<Pool> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return this.pool;
  }

  /**
   * Execute a query
   */
  async query<T extends QueryResultRow = QueryResultRow>(text: string, params?: QueryParams): Promise<QueryResult<T>> {
    const pool = await this.getPool();
    const start = Date.now();
    try {
      const result = await pool.query<T>(text, params);
      const duration = Date.now() - start;

      // Log slow queries (> 1 second)
      if (duration > 1000) {
        dbLogger.warn('Slow query detected', { duration, query: text.substring(0, 100) });
      }

      return result;
    } catch (error) {
      dbLogger.error('Query error', error instanceof Error ? error : new Error(String(error)), { query: text.substring(0, 100) });
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    const pool = await this.getPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a client from the pool
   */
  async getClient(): Promise<PoolClient> {
    const pool = await this.getPool();
    return pool.connect();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as health');
      return result.rows[0]?.health === 1;
    } catch (error) {
      dbLogger.error('Health check failed', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Get pool statistics
   */
  getStats() {
    if (!this.pool) {
      return null;
    }

    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  /**
   * Close the pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
      dbLogger.info('Database pool closed');
    }
  }
}

// Singleton instance
export const db = new DatabasePool();

// Convenience exports
export const query = db.query.bind(db);
export const transaction = db.transaction.bind(db);
export const getClient = db.getClient.bind(db);
export const healthCheck = db.healthCheck.bind(db);
