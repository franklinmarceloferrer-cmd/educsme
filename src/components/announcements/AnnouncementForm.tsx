import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { announcementsApi, type Announcement } from "@/lib/mockApi";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required").max(5000, "Content must be less than 5000 characters"),
  category: z.enum(["general", "academic", "events", "urgent"]),
  isPublished: z.boolean(),
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

interface AnnouncementFormProps {
  announcement?: Announcement;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AnnouncementForm({ announcement, onSuccess, onCancel }: AnnouncementFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: announcement?.title || "",
      content: announcement?.content || "",
      category: announcement?.category || "general",
      isPublished: announcement?.isPublished ?? true,
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

  const onSubmit = async (data: AnnouncementFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (announcement) {
        await updateMutation.mutateAsync({
          id: announcement.id,
          data: { ...data },
        });
      } else {
        await createMutation.mutateAsync({
          title: data.title,
          content: data.content,
          category: data.category,
          author: user.name,
          authorId: user.id,
          isPublished: data.isPublished,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: "general", label: "General" },
    { value: "academic", label: "Academic" },
    { value: "events", label: "Events" },
    { value: "urgent", label: "Urgent" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          {...register("title")}
          placeholder="Enter announcement title"
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={watch("category")}
          onValueChange={(value) => setValue("category", value as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          {...register("content")}
          placeholder="Enter announcement content"
          rows={6}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isPublished"
          checked={watch("isPublished")}
          onCheckedChange={(checked) => setValue("isPublished", checked)}
        />
        <Label htmlFor="isPublished">Publish immediately</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : announcement
            ? "Update Announcement"
            : "Create Announcement"}
        </Button>
      </div>
    </form>
  );
}