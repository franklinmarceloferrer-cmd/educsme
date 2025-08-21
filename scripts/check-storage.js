#!/usr/bin/env node

/**
 * EduCMS Storage Configuration Checker
 * 
 * This script checks if the required Supabase storage buckets are properly configured.
 * Run this script to verify your storage setup before deploying the application.
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  title: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function checkStorageBuckets() {
  log.title('\n🗄️  EduCMS Storage Configuration Checker\n');

  // Get Supabase credentials
  let supabaseUrl = process.env.VITE_SUPABASE_URL;
  let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    supabaseUrl = await askQuestion('Enter your Supabase URL: ');
  }

  if (!supabaseKey) {
    supabaseKey = await askQuestion('Enter your Supabase Anon Key: ');
  }

  if (!supabaseUrl || !supabaseKey) {
    log.error('Supabase URL and Anon Key are required');
    process.exit(1);
  }

  log.info(`Connecting to Supabase project: ${supabaseUrl.split('//')[1]}`);

  const supabase = createClient(supabaseUrl, supabaseKey);

  const requiredBuckets = [
    { name: 'avatars', description: 'Student and user profile pictures', public: true },
    { name: 'documents', description: 'Document library files', public: false },
    { name: 'announcements', description: 'Announcement attachments', public: false }
  ];

  let allBucketsReady = true;
  const results = [];

  log.info('\nChecking storage buckets...\n');

  for (const bucket of requiredBuckets) {
    try {
      // Try to list files in the bucket (this will fail if bucket doesn't exist)
      const { data, error } = await supabase.storage
        .from(bucket.name)
        .list('', { limit: 1 });

      if (error) {
        log.error(`Bucket '${bucket.name}': ${error.message}`);
        results.push({
          name: bucket.name,
          status: 'missing',
          error: error.message,
          description: bucket.description,
          public: bucket.public
        });
        allBucketsReady = false;
      } else {
        log.success(`Bucket '${bucket.name}': Ready`);
        results.push({
          name: bucket.name,
          status: 'ready',
          description: bucket.description,
          public: bucket.public
        });
      }
    } catch (error) {
      log.error(`Bucket '${bucket.name}': ${error.message}`);
      results.push({
        name: bucket.name,
        status: 'error',
        error: error.message,
        description: bucket.description,
        public: bucket.public
      });
      allBucketsReady = false;
    }
  }

  // Summary
  log.title('\n📊 Summary\n');

  if (allBucketsReady) {
    log.success('All storage buckets are properly configured! 🎉');
    log.info('Your EduCMS application is ready for file uploads.');
  } else {
    log.warning('Some storage buckets need to be configured.');
    log.info('\nMissing buckets need to be created manually in your Supabase dashboard:');
    
    const missingBuckets = results.filter(r => r.status !== 'ready');
    
    for (const bucket of missingBuckets) {
      console.log(`\n${colors.yellow}📁 ${bucket.name}${colors.reset}`);
      console.log(`   Description: ${bucket.description}`);
      console.log(`   Type: ${bucket.public ? 'Public' : 'Private'} bucket`);
      if (bucket.error) {
        console.log(`   Error: ${bucket.error}`);
      }
    }

    log.info(`\n🔗 Setup Guide: https://github.com/your-repo/educsme/blob/main/docs/supabase-storage-setup.md`);
    log.info(`🌐 Supabase Dashboard: https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}/storage/buckets`);
  }

  rl.close();
  process.exit(allBucketsReady ? 0 : 1);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  log.error(`Unhandled error: ${error.message}`);
  process.exit(1);
});

// Run the checker
checkStorageBuckets().catch((error) => {
  log.error(`Failed to check storage: ${error.message}`);
  process.exit(1);
});
