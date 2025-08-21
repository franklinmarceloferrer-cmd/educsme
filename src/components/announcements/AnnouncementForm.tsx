import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FileUpload, FileUploadFile } from "@/components/ui/file-upload";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { announcementsApi, type Announcement } from "@/lib/supabaseApi";
import { fileStorage } from "@/lib/fileStorage";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.enum(["general", "urgent", "academic", "event"]),
  priority: z.enum(["low", "medium", "high"]),
  is_published: z.boolean(),
});

interface AnnouncementFormProps {
  announcement?: Announcement;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AnnouncementForm({ announcement, onSuccess, onCancel }: AnnouncementFormProps) {
  const { user } = useAuth();
  const [attachmentFiles, setAttachmentFiles] = useState<FileUploadFile[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: announcement?.title || "",
      content: announcement?.content || "",
      category: announcement?.category || "general",
      priority: announcement?.priority || "medium",
      is_published: announcement?.is_published || false,
    },
  });

  const createMutation = useMutation({
    mutationFn: announcementsApi.create,
    onSuccess: () => {
      toast.success("Announcement created successfully");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to create announcement");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Announcement> }) =>
      announcementsApi.update(id, data),
    onSuccess: () => {
      toast.success("Announcement updated successfully");
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to update announcement");
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    try {
      // Upload attachments first
      const attachments = [];
      for (const fileItem of attachmentFiles) {
        if (fileItem.progress === 100) continue; // Already uploaded

        // Update progress
        setAttachmentFiles(prev => prev.map(f =>
          f.id === fileItem.id ? { ...f, progress: 1 } : f
        ));

        const uploadResult = await fileStorage.uploadFile(
          fileItem.file,
          {
            bucket: 'announcements',
            folder: user.id,
            isPublic: false
          },
          (progress) => {
            setAttachmentFiles(prev => prev.map(f =>
              f.id === fileItem.id ? { ...f, progress } : f
            ));
          }
        );

        if (uploadResult.success && uploadResult.data) {
          attachments.push({
            id: fileItem.id,
            name: fileItem.file.name,
            url: uploadResult.data.fullPath,
            size: fileItem.file.size,
            type: fileItem.file.type
          });

          // Mark as complete
          setAttachmentFiles(prev => prev.map(f =>
            f.id === fileItem.id ? { ...f, progress: 100 } : f
          ));
        } else {
          throw new Error(uploadResult.error || 'Upload failed');
        }
      }

      if (announcement) {
        await updateMutation.mutateAsync({
          id: announcement.id,
          data: {
            ...values,
            attachments: [...(announcement.attachments || []), ...attachments]
          }
        });
      } else {
        await createMutation.mutateAsync({
          title: values.title,
          content: values.content,
          category: values.category,
          priority: values.priority,
          is_published: values.is_published,
          attachments
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit announcement');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter announcement title" {...field} />
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
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="Enter announcement content..."
                  className="min-h-[200px]"
                />
              </FormControl>
              <FormDescription>
                Use the toolbar to format your announcement content
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publish Announcement</FormLabel>
                <FormDescription>
                  Make this announcement visible to all users
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

        {/* File Attachments */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Attachments (Optional)</label>
          <FileUpload
            files={attachmentFiles}
            onFilesSelected={(files) => {
              const fileItems: FileUploadFile[] = files.map(file => ({
                file,
                id: `${Date.now()}-${Math.random()}`,
                progress: 0,
              }));
              setAttachmentFiles(prev => [...prev, ...fileItems]);
            }}
            onFileRemove={(fileId) => {
              setAttachmentFiles(prev => prev.filter(f => f.id !== fileId));
            }}
            maxFiles={3}
            maxSize={10 * 1024 * 1024} // 10MB
            acceptedTypes={[
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'image/jpeg',
              'image/png',
              'image/gif'
            ]}
            disabled={createMutation.isPending || updateMutation.isPending}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : announcement
              ? "Update Announcement"
              : "Create Announcement"}
          </Button>
        </div>
      </form>
    </Form>
  );
}