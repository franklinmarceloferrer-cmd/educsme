import { supabase } from '@/integrations/supabase/client';

export type StorageBucket = 'documents' | 'avatars' | 'announcements';

export interface FileUploadOptions {
  bucket: StorageBucket;
  folder?: string;
  fileName?: string;
  isPublic?: boolean;
}

export interface FileUploadResult {
  success: boolean;
  data?: {
    path: string;
    fullPath: string;
    publicUrl?: string;
  };
  error?: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  publicUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

class FileStorageService {
  /**
   * Upload a file to Supabase Storage
   */
  async uploadFile(
    file: File,
    options: FileUploadOptions,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResult> {
    try {
      const { bucket, folder = '', fileName, isPublic = false } = options;
      
      // Generate unique filename if not provided
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const finalFileName = fileName || `${timestamp}-${file.name}`;
      
      // Create the full path
      const filePath = folder ? `${folder}/${finalFileName}` : finalFileName;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Get public URL if needed
      let publicUrl: string | undefined;
      if (isPublic || bucket === 'avatars') {
        const { data: urlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path);
        publicUrl = urlData.publicUrl;
      }

      return {
        success: true,
        data: {
          path: data.path,
          fullPath: `${bucket}/${data.path}`,
          publicUrl
        }
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    options: FileUploadOptions,
    onProgress?: (fileIndex: number, progress: number) => void
  ): Promise<FileUploadResult[]> {
    const results: FileUploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.uploadFile(
        file,
        options,
        (progress) => onProgress?.(i, progress)
      );
      results.push(result);
    }
    
    return results;
  }

  /**
   * Download a file from storage
   */
  async downloadFile(bucket: StorageBucket, path: string): Promise<Blob | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) {
        console.error('Download error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('File download error:', error);
      return null;
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: StorageBucket, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('File delete error:', error);
      return false;
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: StorageBucket, path: string): string | null {
    try {
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return data.publicUrl;
    } catch (error) {
      console.error('Get public URL error:', error);
      return null;
    }
  }

  /**
   * Get signed URL for private files
   */
  async getSignedUrl(
    bucket: StorageBucket, 
    path: string, 
    expiresIn: number = 3600
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Signed URL error:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Get signed URL error:', error);
      return null;
    }
  }

  /**
   * List files in a bucket/folder
   */
  async listFiles(
    bucket: StorageBucket,
    folder?: string,
    limit: number = 100
  ): Promise<FileMetadata[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('List files error:', error);
        return [];
      }

      return data.map(file => ({
        id: file.id || file.name,
        name: file.name,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || 'application/octet-stream',
        url: this.getPublicUrl(bucket, folder ? `${folder}/${file.name}` : file.name) || '',
        uploadedAt: file.created_at || new Date().toISOString(),
        uploadedBy: file.metadata?.owner || 'Unknown'
      }));
    } catch (error) {
      console.error('List files error:', error);
      return [];
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(
    file: File,
    options: {
      maxSize?: number;
      allowedTypes?: string[];
    } = {}
  ): { valid: boolean; error?: string } {
    const { maxSize = 50 * 1024 * 1024, allowedTypes = [] } = options;

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${this.formatFileSize(maxSize)} limit`
      };
    }

    // Check file type
    if (allowedTypes.length > 0) {
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        return {
          valid: false,
          error: `File type ${file.type} is not allowed`
        };
      }
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const fileStorage = new FileStorageService();
