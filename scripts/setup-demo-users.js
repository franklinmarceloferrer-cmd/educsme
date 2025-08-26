/**
 * Setup Demo Users Script
 * 
 * This script creates the demo users shown on the login page:
 * - admin@edu-cms.com (Admin role)
 * - teacher@edu-cms.com (Teacher role) 
 * - student@edu-cms.com (Student role)
 * 
 * Run this script to populate your Supabase project with test users.
 */

const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  error: (msg) => console.log(`❌ ${msg}`),
  warning: (msg) => console.log(`⚠️  ${msg}`)
};

const demoUsers = [
  {
    email: 'admin@edu-cms.com',
    password: 'password',
    displayName: 'System Administrator',
    role: 'admin'
  },
  {
    email: 'teacher@edu-cms.com', 
    password: 'password',
    displayName: 'Demo Teacher',
    role: 'teacher'
  },
  {
    email: 'student@edu-cms.com',
    password: 'password', 
    displayName: 'Demo Student',
    role: 'student'
  }
];

async function setupDemoUsers() {
  try {
    log.info('Setting up demo users for EduCMS...\n');

    // Get Supabase credentials
    let supabaseUrl = process.env.VITE_SUPABASE_URL;
    let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      supabaseUrl = await askQuestion('Enter your Supabase URL: ');
    }

    if (!supabaseServiceKey) {
      supabaseServiceKey = await askQuestion('Enter your Supabase Service Role Key (from Settings > API): ');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      log.error('Supabase URL and Service Role Key are required');
      process.exit(1);
    }

    log.info(`Connecting to Supabase project: ${supabaseUrl.split('//')[1]}`);

    // Create Supabase client with service role key (required for user creation)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    log.info('Creating demo users...\n');

    for (const user of demoUsers) {
      try {
        log.info(`Creating user: ${user.email} (${user.role})`);

        // Create user with admin API
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true, // Skip email confirmation for demo users
          user_metadata: {
            display_name: user.displayName,
            role: user.role
          }
        });

        if (error) {
          if (error.message.includes('already registered')) {
            log.warning(`User ${user.email} already exists, skipping...`);
          } else {
            log.error(`Failed to create ${user.email}: ${error.message}`);
          }
        } else {
          log.success(`Created user: ${user.email}`);
          
          // The profile should be created automatically by the trigger
          // But let's verify it exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', data.user.id)
            .single();

          if (profileError) {
            log.warning(`Profile creation may have failed for ${user.email}: ${profileError.message}`);
          } else {
            log.success(`Profile created for ${user.email} with role: ${profile.role}`);
          }
        }
      } catch (err) {
        log.error(`Unexpected error creating ${user.email}: ${err.message}`);
      }
    }

    log.success('\n✨ Demo user setup complete!');
    log.info('\nYou can now sign in with:');
    demoUsers.forEach(user => {
      log.info(`  ${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
    });

    log.info('\n🔗 Next steps:');
    log.info('1. Try logging in with any of the demo accounts');
    log.info('2. Check that user profiles were created correctly');
    log.info('3. Verify role-based permissions are working');

  } catch (error) {
    log.error(`Setup failed: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
setupDemoUsers().catch(console.error);