/**
 * Database Pool Tests
 */

import { db } from '../../lib/db/pool';

describe('Database Pool', () => {
  beforeAll(async () => {
    // Initialize pool before tests
    await db.initialize();
  });

  afterAll(async () => {
    // Close pool after tests
    await db.close();
  });

  describe('Connection', () => {
    it('should connect to the database', async () => {
      const result = await db.query('SELECT 1 as test');
      expect(result.rows[0].test).toBe(1);
    });

    it('should pass health check', async () => {
      const healthy = await db.healthCheck();
      expect(healthy).toBe(true);
    });
  });

  describe('Queries', () => {
    it('should execute parameterized queries', async () => {
      const result = await db.query('SELECT $1::text as value', ['test']);
      expect(result.rows[0].value).toBe('test');
    });

    it('should handle query errors', async () => {
      await expect(
        db.query('INVALID SQL')
      ).rejects.toThrow();
    });
  });

  describe('Transactions', () => {
    it('should commit successful transactions', async () => {
      const result = await db.transaction(async (client) => {
        await client.query('SELECT 1');
        return 'success';
      });

      expect(result).toBe('success');
    });

    it('should rollback failed transactions', async () => {
      await expect(
        db.transaction(async (client) => {
          await client.query('SELECT 1');
          throw new Error('Test error');
        })
      ).rejects.toThrow('Test error');
    });
  });

  describe('Pool Stats', () => {
    it('should return pool statistics', () => {
      const stats = db.getStats();

      expect(stats).toHaveProperty('totalCount');
      expect(stats).toHaveProperty('idleCount');
      expect(stats).toHaveProperty('waitingCount');
    });
  });
});
