#!/usr/bin/env node

/**
 * Production Setup Interactive Helper
 * Guides you through production configuration step-by-step
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.blue}${prompt}${colors.reset}`, resolve);
  });
}

async function main() {
  log('\n🚀 Production Setup Helper', 'bright');
  log('=========================\n', 'bright');

  log('This interactive guide will help you configure Hablas for production.\n');
  log('Press Ctrl+C at any time to exit.\n');

  // Step 1: Deployment Platform
  log('Step 1: Deployment Platform', 'green');
  log('---------------------------');
  log('Where will you deploy Hablas?');
  log('1. Vercel (Recommended for Next.js)');
  log('2. Railway');
  log('3. Render');
  log('4. AWS');
  log('5. Other/Self-hosted\n');

  const platform = await question('Enter your choice (1-5): ');
  const platforms = ['vercel', 'railway', 'render', 'aws', 'other'];
  const selectedPlatform = platforms[parseInt(platform) - 1] || 'other';

  log(`✅ Selected: ${selectedPlatform}\n`, 'green');

  // Step 2: Domain
  log('Step 2: Production Domain', 'green');
  log('-------------------------');
  log('What is your production domain?');
  log('Examples: hablas.co, myapp.com\n');

  const domain = await question('Domain (without https://): ');
  const wwwDomain = `www.${domain}`;

  log(`✅ Primary domain: https://${domain}`, 'green');
  log(`✅ WWW domain: https://${wwwDomain}\n`, 'green');

  // Step 3: Database
  log('Step 3: PostgreSQL Database', 'green');
  log('---------------------------');

  if (selectedPlatform === 'vercel') {
    log('For Vercel, I recommend using Vercel Postgres:');
    log('1. Go to your Vercel project dashboard');
    log('2. Click "Storage" tab → "Create Database" → "Postgres"');
    log('3. Copy the connection string\n');
  } else if (selectedPlatform === 'railway') {
    log('For Railway:');
    log('1. In your Railway project, click "+ New"');
    log('2. Select "Database" → "Add PostgreSQL"');
    log('3. Copy the "Postgres Connection URL"\n');
  } else {
    log('Choose your PostgreSQL provider:');
    log('1. Vercel Postgres');
    log('2. Railway Postgres');
    log('3. Supabase');
    log('4. AWS RDS');
    log('5. Custom\n');
  }

  const dbUrl = await question('Paste your DATABASE_URL here: ');

  if (dbUrl.includes('postgres://') || dbUrl.includes('postgresql://')) {
    log('✅ Valid PostgreSQL connection string\n', 'green');
  } else {
    log('⚠️  Warning: This doesn\'t look like a PostgreSQL URL\n', 'yellow');
  }

  // Step 4: Redis
  log('Step 4: Redis (Optional but Recommended)', 'green');
  log('-----------------------------------------');
  log('Redis enables distributed rate limiting across multiple server instances.\n');
  log('Do you want to set up Redis?');
  log('1. Yes, I\'ll use Upstash (Recommended - free tier)');
  log('2. Yes, I\'ll use Railway');
  log('3. Yes, I have custom Redis');
  log('4. No, skip Redis (use in-memory rate limiting)\n');

  const redisChoice = await question('Enter your choice (1-4): ');
  let redisUrl = '';
  let redisPassword = '';

  if (redisChoice === '1' || redisChoice === '2' || redisChoice === '3') {
    redisUrl = await question('Redis URL: ');
    redisPassword = await question('Redis Password (optional, press Enter to skip): ');
    log('✅ Redis configured\n', 'green');
  } else {
    log('⚠️  Skipping Redis - using in-memory rate limiting\n', 'yellow');
  }

  // Generate configuration
  log('\n📝 Generating Configuration...', 'bright');
  log('==============================\n');

  const config = {
    platform: selectedPlatform,
    domain: domain,
    cors: {
      NEXT_PUBLIC_APP_URL: `https://${domain}`,
      ALLOWED_ORIGIN_1: `https://${domain}`,
      ALLOWED_ORIGIN_2: `https://${wwwDomain}`
    },
    database: {
      DATABASE_URL: dbUrl,
      DB_SSL: dbUrl.includes('sslmode=require') || dbUrl.includes('ssl=true') ? 'true' : 'false'
    },
    redis: {
      REDIS_URL: redisUrl,
      REDIS_PASSWORD: redisPassword
    },
    environment: {
      NODE_ENV: 'production'
    }
  };

  // Display configuration
  log('Your Production Configuration:', 'green');
  log('------------------------------\n');
  log('Environment Variables to Set:\n', 'bright');

  console.log(`NODE_ENV=production`);
  console.log(`\n# Database`);
  console.log(`DATABASE_URL=${config.database.DATABASE_URL}`);
  console.log(`DB_SSL=${config.database.DB_SSL}`);
  console.log(`\n# CORS`);
  console.log(`NEXT_PUBLIC_APP_URL=${config.cors.NEXT_PUBLIC_APP_URL}`);
  console.log(`ALLOWED_ORIGIN_1=${config.cors.ALLOWED_ORIGIN_1}`);
  console.log(`ALLOWED_ORIGIN_2=${config.cors.ALLOWED_ORIGIN_2}`);

  if (redisUrl) {
    console.log(`\n# Redis`);
    console.log(`REDIS_URL=${config.redis.REDIS_URL}`);
    if (redisPassword) {
      console.log(`REDIS_PASSWORD=${config.redis.REDIS_PASSWORD}`);
    }
  }

  log('\n\n📋 Next Steps:', 'bright');
  log('=============\n');

  if (selectedPlatform === 'vercel') {
    log('For Vercel Deployment:', 'green');
    log('1. Go to your Vercel project settings');
    log('2. Navigate to "Environment Variables"');
    log('3. Add each variable above');
    log('4. Deploy your app: vercel --prod\n');
  } else if (selectedPlatform === 'railway') {
    log('For Railway Deployment:', 'green');
    log('1. Go to your Railway project');
    log('2. Click "Variables" tab');
    log('3. Add each variable above');
    log('4. Deploy will trigger automatically\n');
  } else {
    log('Deployment Steps:', 'green');
    log('1. Set environment variables in your deployment platform');
    log('2. Use the values printed above');
    log('3. Deploy your application');
    log('4. Verify deployment is successful\n');
  }

  log('After Deployment:', 'yellow');
  log('1. Navigate to your production URL');
  log('2. Login with admin credentials (see docs/DEPLOYMENT_CREDENTIALS.md)');
  log('3. IMMEDIATELY change the admin password');
  log('4. Save new password in password manager');
  log('5. Delete docs/DEPLOYMENT_CREDENTIALS.md\n');

  // Save configuration to file
  const configPath = path.join(process.cwd(), 'production-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  log(`✅ Configuration saved to: ${configPath}`, 'green');
  log('   (This file is for your reference only)\n');

  // Ask if user wants to update .env.local
  const updateLocal = await question('Update .env.local for local production testing? (y/n): ');

  if (updateLocal.toLowerCase() === 'y') {
    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Update NODE_ENV
    envContent = envContent.replace(/NODE_ENV=.*/, 'NODE_ENV=production');

    // Update DATABASE_URL
    envContent = envContent.replace(/DATABASE_URL=.*/, `DATABASE_URL=${config.database.DATABASE_URL}`);

    // Update DB_SSL
    if (envContent.includes('DB_SSL=')) {
      envContent = envContent.replace(/DB_SSL=.*/, `DB_SSL=${config.database.DB_SSL}`);
    } else {
      envContent += `\nDB_SSL=${config.database.DB_SSL}`;
    }

    // Update CORS
    envContent = envContent.replace(/NEXT_PUBLIC_APP_URL=.*/, `NEXT_PUBLIC_APP_URL=${config.cors.NEXT_PUBLIC_APP_URL}`);
    envContent = envContent.replace(/ALLOWED_ORIGIN_1=.*/, `ALLOWED_ORIGIN_1=${config.cors.ALLOWED_ORIGIN_1}`);
    envContent = envContent.replace(/ALLOWED_ORIGIN_2=.*/, `ALLOWED_ORIGIN_2=${config.cors.ALLOWED_ORIGIN_2}`);

    // Update Redis
    if (redisUrl) {
      envContent = envContent.replace(/REDIS_URL=.*/, `REDIS_URL=${config.redis.REDIS_URL}`);
      if (redisPassword) {
        envContent = envContent.replace(/REDIS_PASSWORD=.*/, `REDIS_PASSWORD=${config.redis.REDIS_PASSWORD}`);
      }
    }

    fs.writeFileSync(envPath, envContent);
    log('✅ .env.local updated successfully\n', 'green');
  }

  log('🎉 Production setup complete!', 'bright');
  log('\nGood luck with your deployment! 🚀\n');

  rl.close();
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});
