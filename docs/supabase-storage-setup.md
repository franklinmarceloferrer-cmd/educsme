# Supabase Storage Setup Guide for EduCMS

## 🎯 **Overview**

This guide helps you set up the required Supabase storage buckets for the EduCMS application to enable file upload functionality without RLS policy violations.

## 🚨 **Common Error**

**Error Message:**
```
StorageApiError: new row violates row-level security policy (HTTP 400)
```

**Cause:** The application cannot create storage buckets programmatically due to Row Level Security (RLS) policies. Buckets must be created manually in the Supabase dashboard.

---

## 📋 **Required Storage Buckets**

The EduCMS application requires three storage buckets:

### 1. **avatars** (Public Bucket)
- **Purpose**: Student and user profile pictures
- **Access**: Public read, authenticated write
- **File Types**: Images (JPG, PNG, WebP)
- **Max Size**: 5MB per file

### 2. **documents** (Private Bucket)
- **Purpose**: Document library files
- **Access**: Role-based (admin/teacher upload, student read)
- **File Types**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Max Size**: 50MB per file

### 3. **announcements** (Private Bucket)
- **Purpose**: Announcement attachments
- **Access**: Admin/teacher upload, all authenticated read
- **File Types**: Images, documents, archives
- **Max Size**: 25MB per file

---

## 🛠️ **Step-by-Step Setup**

### **Step 1: Access Supabase Dashboard**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `rttarliasydfffldayui`
3. Navigate to **Storage** → **Buckets** in the sidebar

### **Step 2: Create Storage Buckets**

#### **Create 'avatars' Bucket (Public)**

1. Click **"New bucket"**
2. **Bucket name**: `avatars`
3. **Public bucket**: ✅ **Enable** (checked)
4. **File size limit**: `5242880` (5MB)
5. **Allowed MIME types**: `image/jpeg,image/png,image/webp,image/gif`
6. Click **"Create bucket"**

#### **Create 'documents' Bucket (Private)**

1. Click **"New bucket"**
2. **Bucket name**: `documents`
3. **Public bucket**: ❌ **Disable** (unchecked)
4. **File size limit**: `52428800` (50MB)
5. **Allowed MIME types**: 
   ```
   application/pdf,
   application/msword,
   application/vnd.openxmlformats-officedocument.wordprocessingml.document,
   application/vnd.ms-excel,
   application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
   application/vnd.ms-powerpoint,
   application/vnd.openxmlformats-officedocument.presentationml.presentation,
   text/plain,
   image/jpeg,
   image/png
   ```
6. Click **"Create bucket"**

#### **Create 'announcements' Bucket (Private)**

1. Click **"New bucket"**
2. **Bucket name**: `announcements`
3. **Public bucket**: ❌ **Disable** (unchecked)
4. **File size limit**: `26214400` (25MB)
5. **Allowed MIME types**: 
   ```
   image/jpeg,
   image/png,
   image/webp,
   image/gif,
   application/pdf,
   application/msword,
   application/vnd.openxmlformats-officedocument.wordprocessingml.document,
   application/zip,
   application/x-zip-compressed
   ```
6. Click **"Create bucket"**

### **Step 3: Configure Row Level Security (RLS) Policies**

#### **For 'avatars' Bucket (Public)**

Since this is a public bucket, files are automatically readable by everyone. You may want to add upload restrictions:

```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### **For 'documents' Bucket (Private)**

```sql
-- Allow authenticated users to view documents
CREATE POLICY "Authenticated users can view documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
);

-- Allow admin and teachers to upload documents
CREATE POLICY "Admin and teachers can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND (
    auth.jwt() ->> 'user_role' = 'admin' 
    OR auth.jwt() ->> 'user_role' = 'teacher'
  )
);

-- Allow admin and teachers to update documents
CREATE POLICY "Admin and teachers can update documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND (
    auth.jwt() ->> 'user_role' = 'admin' 
    OR auth.jwt() ->> 'user_role' = 'teacher'
  )
);

-- Allow admin to delete any document, teachers can delete their own
CREATE POLICY "Admin and teachers can delete documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documents' 
  AND auth.role() = 'authenticated'
  AND (
    auth.jwt() ->> 'user_role' = 'admin' 
    OR (
      auth.jwt() ->> 'user_role' = 'teacher' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
  )
);
```

#### **For 'announcements' Bucket (Private)**

```sql
-- Allow authenticated users to view announcement attachments
CREATE POLICY "Authenticated users can view announcement attachments" ON storage.objects
FOR SELECT USING (
  bucket_id = 'announcements' 
  AND auth.role() = 'authenticated'
);

-- Allow admin and teachers to upload announcement attachments
CREATE POLICY "Admin and teachers can upload announcement attachments" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'announcements' 
  AND auth.role() = 'authenticated'
  AND (
    auth.jwt() ->> 'user_role' = 'admin' 
    OR auth.jwt() ->> 'user_role' = 'teacher'
  )
);

-- Allow admin and teachers to update announcement attachments
CREATE POLICY "Admin and teachers can update announcement attachments" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'announcements' 
  AND auth.role() = 'authenticated'
  AND (
    auth.jwt() ->> 'user_role' = 'admin' 
    OR auth.jwt() ->> 'user_role' = 'teacher'
  )
);

-- Allow admin to delete any attachment, teachers can delete their own
CREATE POLICY "Admin and teachers can delete announcement attachments" ON storage.objects
FOR DELETE USING (
  bucket_id = 'announcements' 
  AND auth.role() = 'authenticated'
  AND (
    auth.jwt() ->> 'user_role' = 'admin' 
    OR (
      auth.jwt() ->> 'user_role' = 'teacher' 
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
  )
);
```

---

## ✅ **Verification Steps**

### **1. Check Bucket Creation**
- Go to Storage → Buckets in Supabase dashboard
- Verify all three buckets exist: `avatars`, `documents`, `announcements`
- Check public/private settings are correct

### **2. Test File Upload**
- Log into EduCMS as an admin or teacher
- Try uploading a student avatar
- Try uploading a document to the library
- Try adding an attachment to an announcement

### **3. Check Application Status**
- Go to Dashboard in EduCMS
- Look for storage status alerts
- Green alert = All buckets configured correctly
- Orange alert = Some buckets missing or misconfigured

---

## 🔧 **Troubleshooting**

### **Issue: "Bucket not found" Error**
**Solution:** Ensure bucket names are exactly: `avatars`, `documents`, `announcements` (lowercase, no spaces)

### **Issue: "Access denied" Error**
**Solution:** Check RLS policies are created and user roles are set correctly in JWT tokens

### **Issue: "File type not allowed" Error**
**Solution:** Verify MIME types are configured correctly in bucket settings

### **Issue: "File too large" Error**
**Solution:** Check file size limits in bucket configuration

---

## 📞 **Support**

If you continue to experience issues:

1. Check the browser console for detailed error messages
2. Verify your Supabase project URL and API keys
3. Ensure your user account has the correct role assigned
4. Contact your system administrator for RLS policy assistance

---

**✅ Once all buckets are created and configured, the EduCMS file upload functionality will work correctly without RLS policy violations.**
