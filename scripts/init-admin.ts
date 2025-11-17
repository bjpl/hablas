#!/usr/bin/env tsx

/**
 * Initialize Default Admin User
 * Creates the initial admin account if no users exist
 */

import { initializeDefaultAdmin } from '../lib/auth/users';

async function main() {
  console.log('🔐 Initializing authentication system...\n');

  try {
    await initializeDefaultAdmin();
    console.log('\n✅ Authentication system initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Failed to initialize authentication:', error);
    process.exit(1);
  }
}

main();
