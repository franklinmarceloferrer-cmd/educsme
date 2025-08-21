# EduCMS API Documentation

## 🏗️ **Backend Architecture**

### Current Implementation
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Real-time)
- **Authentication**: Supabase Auth with JWT tokens
- **Database**: PostgreSQL with Row Level Security (RLS)
- **File Storage**: Supabase Storage (to be implemented)
- **Real-time**: Supabase Real-time subscriptions (to be implemented)

### Database Schema

#### Tables Overview
```sql
-- User profiles for additional user information
profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('admin', 'teacher', 'student')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Announcements with categories and publishing
announcements (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('general', 'urgent', 'academic', 'event')),
  author_id UUID REFERENCES auth.users(id),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Student records with enrollment information
students (
  id UUID PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  grade TEXT NOT NULL,
  section TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT CHECK (status IN ('active', 'inactive', 'graduated')),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Document management with categories
documents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT NOT NULL,
  category TEXT CHECK (category IN ('general', 'academic', 'administrative', 'policy')),
  uploaded_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🔐 **Authentication & Authorization**

### Authentication Flow
1. **Sign Up**: `supabase.auth.signUp({ email, password, options })`
2. **Sign In**: `supabase.auth.signInWithPassword({ email, password })`
3. **Sign Out**: `supabase.auth.signOut()`
4. **Session Management**: Automatic JWT token refresh

### Role-Based Access Control (RLS Policies)

#### Profiles
- **Read**: All authenticated users can view profiles
- **Update**: Users can only update their own profile
- **Insert**: Users can only create their own profile

#### Announcements
- **Read**: 
  - Students: Only published announcements
  - Teachers/Admins: All announcements
- **Create**: Teachers and Admins only
- **Update/Delete**: Authors can modify their own announcements

#### Students
- **Read**: 
  - Teachers/Admins: All student records
  - Students: Only their own record
- **Manage**: Teachers and Admins only

#### Documents
- **Read**: 
  - Public documents: Everyone
  - Private documents: Teachers and Admins only
- **Manage**: Teachers and Admins only

## 📡 **API Endpoints**

### Dashboard API
```typescript
// Get dashboard statistics
dashboardApi.getStats(): Promise<DashboardStats>
// Returns: { totalStudents, totalTeachers, totalAnnouncements, totalDocuments }

// Get recent activity
dashboardApi.getRecentActivity(): Promise<RecentActivity[]>
// Returns: Array of recent system activities
```

### Announcements API
```typescript
// Get all announcements (filtered by user role)
announcementsApi.getAll(): Promise<Announcement[]>

// Get announcement by ID
announcementsApi.getById(id: string): Promise<Announcement | null>

// Create new announcement
announcementsApi.create(announcement: CreateAnnouncementData): Promise<Announcement>

// Update announcement
announcementsApi.update(id: string, updates: UpdateAnnouncementData): Promise<Announcement>

// Delete announcement
announcementsApi.delete(id: string): Promise<void>
```

### Students API
```typescript
// Get all students (role-based filtering)
studentsApi.getAll(): Promise<Student[]>

// Get student by ID
studentsApi.getById(id: string): Promise<Student | null>

// Create new student
studentsApi.create(student: CreateStudentData): Promise<Student>

// Update student
studentsApi.update(id: string, updates: UpdateStudentData): Promise<Student>

// Delete student
studentsApi.delete(id: string): Promise<void>
```

### Documents API (To Be Completed)
```typescript
// Get all documents (role-based filtering)
documentsApi.getAll(): Promise<Document[]>

// Upload new document
documentsApi.upload(file: File, metadata: DocumentMetadata): Promise<Document>

// Download document
documentsApi.download(id: string): Promise<Blob>

// Delete document
documentsApi.delete(id: string): Promise<void>
```

## 🔧 **Supabase Configuration**

### Environment Variables
```env
VITE_SUPABASE_URL=https://rttarliasydfffldayui.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Client Configuration
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

## 📁 **File Storage Integration (To Be Implemented)**

### Storage Buckets
```typescript
// Create storage buckets
- documents: For general document uploads
- avatars: For user profile pictures
- announcements: For announcement attachments
```

### File Upload Flow
```typescript
// 1. Upload file to Supabase Storage
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`${userId}/${fileName}`, file);

// 2. Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('documents')
  .getPublicUrl(filePath);

// 3. Save metadata to documents table
const { data: document } = await supabase
  .from('documents')
  .insert({
    name: file.name,
    file_url: publicUrl,
    file_size: file.size,
    file_type: file.type,
    uploaded_by: userId,
    category: category
  });
```

## 🔄 **Real-time Features (To Be Implemented)**

### Real-time Subscriptions
```typescript
// Subscribe to announcement changes
const subscription = supabase
  .channel('announcements')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'announcements' },
    (payload) => {
      // Handle real-time updates
    }
  )
  .subscribe();
```

## 🚨 **Error Handling**

### Common Error Patterns
```typescript
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');
    
  if (error) throw error;
  return data;
} catch (error) {
  console.error('API Error:', error);
  throw new Error('Failed to fetch data');
}
```

### Error Types
- **Authentication Errors**: Invalid credentials, expired tokens
- **Authorization Errors**: Insufficient permissions
- **Validation Errors**: Invalid data format
- **Network Errors**: Connection issues
- **Storage Errors**: File upload/download failures

## 📊 **API Response Formats**

### Success Response
```typescript
{
  data: T, // Requested data
  error: null
}
```

### Error Response
```typescript
{
  data: null,
  error: {
    message: string,
    details?: string,
    hint?: string,
    code?: string
  }
}
```

## 🔍 **Testing API Endpoints**

### Using Supabase Dashboard
1. Navigate to Table Editor
2. Use SQL Editor for complex queries
3. Test RLS policies with different user roles
4. Monitor real-time subscriptions

### Using Postman/Insomnia
```bash
# Headers required
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

## 📈 **Performance Considerations**

1. **Pagination**: Implement for large datasets
2. **Caching**: Use React Query for client-side caching
3. **Optimistic Updates**: Update UI before API confirmation
4. **Batch Operations**: Group multiple operations when possible
5. **Connection Pooling**: Handled automatically by Supabase

## 🔗 **Integration Status**

### ✅ Currently Integrated
- Authentication (Supabase Auth)
- Dashboard statistics
- Announcements CRUD
- Students CRUD
- Basic RLS policies

### 🔄 Partially Integrated
- Documents (metadata only, no file storage)
- User profiles (basic implementation)

### ❌ Not Yet Integrated
- File upload/download
- Real-time subscriptions
- Advanced reporting
- Notification system
