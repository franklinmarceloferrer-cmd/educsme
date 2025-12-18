# EduCMS Demo & Seed Data Guide

## Overview

EduCMS comes pre-seeded with realistic educational data to demonstrate the system's capabilities. This makes it ready for portfolio presentations, technical interviews, and feature demonstrations.

## Seed Data Included

### Students (10 records)
- Mix of grades (9th, 10th, 11th, 12th)
- Different sections (A, B, C)
- Varied enrollment dates and statuses
- Brazilian-style names and addresses for authenticity

### Announcements (5 records)
- Welcome announcement (high priority)
- Academic calendar notice
- Mid-term exam schedule
- Library hours update
- Code of conduct notice

### Documents (5 records)
- Student Handbook 2025
- Academic Calendar 2025
- Mid-Term Exam Timetable
- Code of Conduct Policy
- Course Catalog 2025

## User Account Setup

### Creating Your Account
1. Navigate to the login page
2. Click "Sign Up" tab
3. Enter your details (display name, email, password)
4. Your account will be created with the **student** role

### Role Elevation (Security)
For security reasons, new users always start as students. Role elevation requires:
- An existing admin to use the admin panel
- Or direct database access via the `update_user_role()` function

```sql
-- Example: Elevate user to admin (requires admin privileges)
SELECT update_user_role('user-uuid-here', 'admin');
```

## Available Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Full system control, user management, all CRUD operations |
| **Teacher** | Create announcements, manage documents, view students |
| **Student** | View public announcements and documents, view own profile |

## For Portfolio Demonstrations

When presenting this project, you can highlight:

✅ **Role-based Access Control** - Different views for admin/teacher/student  
✅ **Complete CRUD Operations** - Create, read, update, delete with real data  
✅ **Professional Data Modeling** - Realistic educational content  
✅ **Secure Role Management** - Database-enforced role protection  
✅ **Modern UI/UX** - Responsive design with light/dark themes  

## Technical Implementation

### Security Features
- Row Level Security (RLS) on all tables
- Role validation at database level
- No client-side role elevation possible
- Server-side access control enforcement

### Data Categories

**Announcements**: `general`, `urgent`, `academic`, `event`  
**Documents**: `general`, `academic`, `administrative`, `policy`  
**Priorities**: `low`, `medium`, `high`  

## Resetting Seed Data

To reset the database with fresh seed data:

1. Clear existing data (optional)
2. Re-run the seed SQL scripts
3. Recreate user accounts as needed

## Production Deployment Notes

In production environments:
- Remove or replace seed data with real content
- Use strong, unique passwords for all accounts
- Enable email confirmation
- Review and tighten RLS policies as needed
- Set up proper backup procedures
