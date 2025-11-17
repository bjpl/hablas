/**
 * Database Configuration
 * Centralized database connection settings and validation
 */

export const DATABASE_CONFIG = {
  /**
   * Get database connection string from environment
   */
  getConnectionString(): string {
    const url = process.env.DATABASE_URL;

    if (!url) {
      throw new Error(
        'DATABASE_URL environment variable is required. ' +
          'Please set it in your .env.local file. ' +
          'Example: postgresql://username:password@localhost:5432/hablas'
      );
    }

    return url;
  },

  /**
   * Get fallback connection parameters
   */
  getConnectionParams() {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'hablas',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
    };
  },

  /**
   * Get pool configuration
   */
  getPoolConfig() {
    return {
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT || '2000', 10),
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };
  },

  /**
   * Check if database is configured
   */
  isConfigured(): boolean {
    return !!process.env.DATABASE_URL || !!process.env.DB_PASSWORD;
  },

  /**
   * Get environment-specific settings
   */
  getEnvironmentSettings() {
    const env = process.env.NODE_ENV || 'development';

    return {
      development: {
        logQueries: true,
        logErrors: true,
        ssl: false,
      },
      production: {
        logQueries: false,
        logErrors: true,
        ssl: true,
      },
      test: {
        logQueries: false,
        logErrors: false,
        ssl: false,
      },
    }[env] || {
      logQueries: false,
      logErrors: true,
      ssl: false,
    };
  },
};
