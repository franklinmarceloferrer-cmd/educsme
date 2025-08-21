import { supabase } from '@/integrations/supabase/client';

/**
 * Setup storage buckets for the application
 * This should be run once to initialize the storage system
 */
export async function setupStorageBuckets() {
  try {
    console.log('Setting up storage buckets...');

    // Create documents bucket
    const { data: documentsData, error: documentsError } = await supabase.storage
      .createBucket('documents', {
        public: false,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'image/jpeg',
          'image/png',
          'image/gif'
        ]
      });

    if (documentsError && !documentsError.message.includes('already exists')) {
      console.error('Error creating documents bucket:', documentsError);
    } else {
      console.log('Documents bucket created/exists');
    }

    // Create avatars bucket
    const { data: avatarsData, error: avatarsError } = await supabase.storage
      .createBucket('avatars', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp'
        ]
      });

    if (avatarsError && !avatarsError.message.includes('already exists')) {
      console.error('Error creating avatars bucket:', avatarsError);
    } else {
      console.log('Avatars bucket created/exists');
    }

    // Create announcements bucket
    const { data: announcementsData, error: announcementsError } = await supabase.storage
      .createBucket('announcements', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
      });

    if (announcementsError && !announcementsError.message.includes('already exists')) {
      console.error('Error creating announcements bucket:', announcementsError);
    } else {
      console.log('Announcements bucket created/exists');
    }

    console.log('Storage setup completed');
    return true;
  } catch (error) {
    console.error('Error setting up storage:', error);
    return false;
  }
}

/**
 * Check if storage buckets exist
 */
export async function checkStorageBuckets() {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      return false;
    }

    const requiredBuckets = ['documents', 'avatars', 'announcements'];
    const existingBuckets = buckets.map(bucket => bucket.name);
    const missingBuckets = requiredBuckets.filter(bucket => !existingBuckets.includes(bucket));

    if (missingBuckets.length > 0) {
      console.log('Missing buckets:', missingBuckets);
      return false;
    }

    console.log('All required buckets exist');
    return true;
  } catch (error) {
    console.error('Error checking storage buckets:', error);
    return false;
  }
}

/**
 * Initialize storage system - check and create buckets if needed
 */
export async function initializeStorage() {
  const bucketsExist = await checkStorageBuckets();
  
  if (!bucketsExist) {
    console.log('Some buckets are missing, creating them...');
    return await setupStorageBuckets();
  }
  
  console.log('Storage system is ready');
  return true;
}
