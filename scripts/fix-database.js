// Fix Database Utility Script
const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function main() {
  console.log('🔍 Database Connection Test Utility');
  console.log('====================================');
  
  // 1. Check environment variables
  console.log('\n✅ Checking environment variables...');
  const requiredVars = ['DATABASE_URL', 'DIRECT_URL'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
    console.log('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are present.');
  
  // 2. Check database connection
  console.log('\n🔄 Testing database connection...');
  
  const prisma = new PrismaClient();
  try {
    // Try to connect and run a simple query
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('✅ Successfully connected to the database!');
    
    // Check if we can access tables
    console.log('\n🔄 Testing table access...');
    const tables = ['User', 'Movie', 'Theater', 'Showtime', 'Booking'];
    
    for (const table of tables) {
      try {
        const count = await prisma[table.toLowerCase()].count();
        console.log(`✅ Table '${table}' is accessible (${count} records)`);
      } catch (error) {
        console.error(`❌ Could not access table '${table}': ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    // Try to diagnose common issues
    if (error.message.includes('timeout')) {
      console.log('\n💡 Connection timed out. This might indicate:');
      console.log('   - Network connectivity issues');
      console.log('   - Database server is down or unreachable');
      console.log('   - Firewall blocking the connection');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Authentication failed. This might indicate:');
      console.log('   - Wrong username or password in the connection string');
      console.log('   - User does not have permission to access the database');
    }
    
    if (error.message.includes('database') && error.message.includes('exist')) {
      console.log('\n💡 Database does not exist. You might need to create it first.');
    }
    
    console.log('\n📋 Suggested actions:');
    console.log('   1. Verify your DATABASE_URL and DIRECT_URL in .env file');
    console.log('   2. Check if the database server is running');
    console.log('   3. Ensure your IP is allowed to connect to the database');
    console.log('   4. Try running `npx prisma db push` to create the database');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
  
  // 3. Run database migrations
  console.log('\n🔄 Checking migration status...');
  
  try {
    const migrationDir = path.join(__dirname, '..', 'prisma', 'migrations');
    
    if (fs.existsSync(migrationDir) && fs.readdirSync(migrationDir).length > 0) {
      console.log('✅ Migrations folder exists and contains migrations.');
      
      console.log('\n🔄 Applying migrations...');
      await runCommand('npx prisma migrate deploy');
    } else {
      console.log('⚠️ No migrations found. Creating initial schema...');
      await runCommand('npx prisma db push');
    }
  } catch (error) {
    console.error('❌ Migration check failed:', error.message);
    process.exit(1);
  }
  
  // 4. Run seed (optional)
  console.log('\n❓ Do you want to seed the database with sample data? (y/n)');
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', async (data) => {
    const input = data.trim().toLowerCase();
    
    if (input === 'y' || input === 'yes') {
      console.log('\n🔄 Seeding database...');
      try {
        await runCommand('node prisma/seed.ts');
        console.log('✅ Database seeded successfully!');
      } catch (error) {
        console.error('❌ Seeding failed:', error.message);
      }
    } else {
      console.log('Skipping database seed.');
    }
    
    console.log('\n✅ Database setup complete!');
    process.exit(0);
  });
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Running: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`stderr: ${stderr}`);
      }
      
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });
  });
}

main().catch(e => {
  console.error('Script failed with error:', e);
  process.exit(1);
}); 