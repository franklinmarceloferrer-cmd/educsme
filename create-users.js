// Simple script to create demo users
// Run with: node create-users.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://rttarliasydfffldayui.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_KEY_HERE'; // Replace with your service key

// Get service key from: https://supabase.com/dashboard/project/rttarliasydfffldayui/settings/api
// Look for "service_role" key (NOT the anon key)

async function createDemoUsers() {
  if (SUPABASE_SERVICE_KEY === 'YOUR_SERVICE_KEY_HERE') {
    console.log('❌ Please replace YOUR_SERVICE_KEY_HERE with your actual service key');
    console.log('Get it from: https://supabase.com/dashboard/project/rttarliasydfffldayui/settings/api');
    console.log('Look for the "service_role" key (keep it secret!)');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const users = [
    { email: 'admin@edu-cms.com', password: 'password', name: 'System Administrator', role: 'admin' },
    { email: 'teacher@edu-cms.com', password: 'password', name: 'Demo Teacher', role: 'teacher' },
    { email: 'student@edu-cms.com', password: 'password', name: 'Demo Student', role: 'student' }
  ];

  console.log('Creating demo users...\n');

  for (const user of users) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          display_name: user.name,
          role: user.role
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`⚠️  ${user.email} already exists`);
        } else {
          console.log(`❌ Failed to create ${user.email}: ${error.message}`);
        }
      } else {
        console.log(`✅ Created ${user.email} (${user.role})`);
      }
    } catch (err) {
      console.log(`❌ Error creating ${user.email}: ${err.message}`);
    }
  }

  console.log('\n🎉 Done! Try logging in with:');
  console.log('admin@edu-cms.com / password');
}

createDemoUsers().catch(console.error);