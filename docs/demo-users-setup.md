# Demo Users Setup Guide

## Problem
Getting a 400 error when trying to sign in with the demo credentials shown on the login page:
- admin@edu-cms.com / password
- teacher@edu-cms.com / password  
- student@edu-cms.com / password

## Root Cause
The demo users don't exist in your Supabase Auth system. The credentials shown are just placeholders.

## Solution Options

### Option 1: Run the Migration (Recommended)
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/rttarliasydfffldayui
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/20250826000000_create_demo_users.sql`
4. Click **Run** to execute the migration
5. The demo users will be created with confirmed emails

### Option 2: Use the Setup Script
1. Install dependencies: `npm install`
2. Run the setup script: `node scripts/setup-demo-users.js`
3. When prompted, provide:
   - Your Supabase URL: `https://rttarliasydfffldayui.supabase.co`
   - Your Service Role Key (from Supabase Dashboard → Settings → API)

### Option 3: Create Users Manually
1. Go to Supabase Dashboard → Authentication → Users
2. Click **Add User**
3. Create each demo user:
   - Email: admin@edu-cms.com, Password: password
   - Email: teacher@edu-cms.com, Password: password
   - Email: student@edu-cms.com, Password: password
4. For each user, set the user metadata:
   ```json
   {
     "display_name": "System Administrator", 
     "role": "admin"
   }
   ```

### Option 4: Sign Up New Users
Instead of using the demo credentials, create new accounts:
1. Go to the Sign Up tab on the login page
2. Create a new account with your email
3. Check your email for confirmation (if required)
4. Sign in with your new credentials

## What Gets Created
The migration/script creates:
- 3 demo users with confirmed emails
- Corresponding profiles with proper roles
- Sample student records for testing
- A sample announcement

## Verification
After setup, you should be able to:
1. Sign in with any demo account
2. See role-appropriate content (admin sees everything, students see limited content)
3. Navigate through the dashboard without errors

## Security Note
In production:
- Remove or change demo user passwords
- Use strong passwords
- Enable email confirmation
- Consider removing demo users entirely