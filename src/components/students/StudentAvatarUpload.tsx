import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { fileStorage } from '@/lib/fileStorage';
import { studentsApi, type Student } from '@/lib/supabaseApi';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface StudentAvatarUploadProps {
  student: Student;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  className?: string;
}

export function StudentAvatarUpload({ 
  student, 
  size = 'md', 
  editable = true,
  className 
}: StudentAvatarUploadProps) {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-16 w-16',
    lg: 'h-24 w-24'
  };

  const updateMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      return await studentsApi.update(student.id, { avatar_url: avatarUrl });
    },
    onSuccess: () => {
      toast.success('Profile photo updated successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setPreviewUrl(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile photo');
      setPreviewUrl(null);
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = fileStorage.validateFile(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    
    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    try {
      // Upload to avatars bucket
      const uploadResult = await fileStorage.uploadFile(
        file,
        {
          bucket: 'avatars',
          folder: student.id,
          fileName: `avatar-${Date.now()}.${file.name.split('.').pop()}`,
          isPublic: true
        }
      );

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Update student record
      await updateMutation.mutateAsync(uploadResult.data.publicUrl || uploadResult.data.fullPath);
    } catch (error) {
      console.error('Avatar upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';

      // Provide helpful error messages for common issues
      if (errorMessage.includes('bucket')) {
        toast.error('Storage not configured. Please contact administrator to set up avatar storage.');
      } else if (errorMessage.includes('policy')) {
        toast.error('Permission denied. You may not have permission to upload avatars.');
      } else if (errorMessage.includes('size')) {
        toast.error('File too large. Please choose an image smaller than 5MB.');
      } else {
        toast.error(errorMessage);
      }

      setIsUploading(false);
      setPreviewUrl(null);
    }

    // Reset input
    event.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (!student.avatar_url) return;

    setIsUploading(true);
    try {
      // Remove from storage if it's a Supabase storage URL
      if (student.avatar_url.includes('supabase')) {
        const pathParts = student.avatar_url.split('/');
        const fileName = pathParts[pathParts.length - 1];
        await fileStorage.deleteFile('avatars', `${student.id}/${fileName}`);
      }

      // Update student record
      await updateMutation.mutateAsync('');
    } catch (error) {
      console.error('Avatar removal error:', error);
      toast.error('Failed to remove avatar');
      setIsUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const currentAvatarUrl = previewUrl || student.avatar_url;

  return (
    <div className={cn('relative inline-block', className)}>
      <Avatar className={sizeClasses[size]}>
        <AvatarImage 
          src={currentAvatarUrl || undefined} 
          alt={`${student.name}'s avatar`}
        />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {getInitials(student.name)}
        </AvatarFallback>
      </Avatar>

      {editable && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/50 rounded-full">
          <div className="flex gap-1">
            <label htmlFor={`avatar-upload-${student.id}`}>
              <Button
                size="sm"
                variant="secondary"
                className="h-6 w-6 p-0"
                disabled={isUploading}
                asChild
              >
                <span>
                  {isUploading ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Camera className="h-3 w-3" />
                  )}
                </span>
              </Button>
            </label>
            
            {student.avatar_url && (
              <Button
                size="sm"
                variant="destructive"
                className="h-6 w-6 p-0"
                onClick={handleRemoveAvatar}
                disabled={isUploading}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      <input
        id={`avatar-upload-${student.id}`}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
