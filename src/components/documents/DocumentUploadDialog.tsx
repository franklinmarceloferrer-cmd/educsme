import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUpload, FileUploadFile } from '@/components/ui/file-upload';
import { fileStorage } from '@/lib/fileStorage';
import { documentsApi } from '@/lib/supabaseApi';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  name: z.string().min(1, 'Document name is required'),
  description: z.string().optional(),
  category: z.enum(['general', 'academic', 'administrative', 'policy']),
  is_public: z.boolean().default(false),
});

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentUploadDialog({ open, onOpenChange }: DocumentUploadDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<FileUploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'general',
      is_public: false,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (files.length === 0) {
        throw new Error('Please select at least one file');
      }

      const results = [];
      setIsUploading(true);

      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        
        // Update progress to show upload starting
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, progress: 1 } : f
        ));

        try {
          // Upload file to Supabase Storage
          const uploadResult = await fileStorage.uploadFile(
            fileItem.file,
            {
              bucket: 'documents',
              folder: user?.id,
              isPublic: values.is_public
            },
            (progress) => {
              setFiles(prev => prev.map(f => 
                f.id === fileItem.id ? { ...f, progress } : f
              ));
            }
          );

          if (!uploadResult.success || !uploadResult.data) {
            throw new Error(uploadResult.error || 'Upload failed');
          }

          // Create document record in database
          const document = await documentsApi.create({
            name: values.name || fileItem.file.name,
            description: values.description,
            file_url: uploadResult.data.publicUrl || uploadResult.data.fullPath,
            file_size: fileItem.file.size,
            file_type: fileItem.file.type,
            category: values.category,
            uploaded_by: user?.id || '',
            is_public: values.is_public,
          });

          // Mark as complete
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, progress: 100, url: document.file_url } : f
          ));

          results.push(document);
        } catch (error) {
          // Mark as error
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { 
              ...f, 
              error: error instanceof Error ? error.message : 'Upload failed' 
            } : f
          ));
          throw error;
        }
      }

      return results;
    },
    onSuccess: () => {
      toast.success('Documents uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      handleClose();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  const handleFilesSelected = (newFiles: File[]) => {
    const fileItems: FileUploadFile[] = newFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
      progress: 0,
    }));
    setFiles(prev => [...prev, ...fileItems]);

    // Auto-fill name if only one file and name is empty
    if (newFiles.length === 1 && !form.getValues('name')) {
      form.setValue('name', newFiles[0].name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleFileRemove = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleClose = () => {
    if (!isUploading) {
      form.reset();
      setFiles([]);
      onOpenChange(false);
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    uploadMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload files to the document library. Files will be stored securely and made available based on your privacy settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Files</label>
              <FileUpload
                files={files}
                onFilesSelected={handleFilesSelected}
                onFileRemove={handleFileRemove}
                maxFiles={5}
                maxSize={50 * 1024 * 1024} // 50MB
                acceptedTypes={[
                  'application/pdf',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                  'text/plain',
                  'image/jpeg',
                  'image/png',
                  'image/gif'
                ]}
                disabled={isUploading}
              />
            </div>

            {/* Document Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter document name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="administrative">Administrative</SelectItem>
                        <SelectItem value="policy">Policy</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter document description"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Public Access</FormLabel>
                    <FormDescription>
                      Make this document visible to all users (students can view)
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={files.length === 0 || isUploading}
                loading={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Documents'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
