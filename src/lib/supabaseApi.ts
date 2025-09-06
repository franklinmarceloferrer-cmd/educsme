import { supabase } from '@/integrations/supabase/client';
import { errorService, logApiError } from '@/services/errorService';

// Types with proper casting
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalAnnouncements: number;
  totalDocuments: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  type: 'announcement' | 'student' | 'document' | 'user';
}

export interface AnnouncementAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'urgent' | 'academic' | 'event';
  priority: 'low' | 'medium' | 'high';
  author: string;
  is_published: boolean;
  attachments: AnnouncementAttachment[];
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  student_id: string;
  name: string;
  email: string;
  grade: string;
  section: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated';
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  name: string;
  description?: string;
  file_url: string;
  file_size?: number;
  file_type: string;
  category: 'general' | 'academic' | 'administrative' | 'policy';
  uploaded_by: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const [studentsResult, announcementsResult, documentsResult] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('announcements').select('id', { count: 'exact' }),
        supabase.from('documents').select('id', { count: 'exact' })
      ]);

      // Count teachers using secure function
      const { data: teacherCountData } = await supabase.rpc('get_role_count', { 
        target_role: 'teacher' 
      });
      const teacherCount = teacherCountData || 0;

      return {
        totalStudents: studentsResult.count || 0,
        totalTeachers: teacherCount || 0,
        totalAnnouncements: announcementsResult.count || 0,
        totalDocuments: documentsResult.count || 0,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  getRecentActivity: async (): Promise<RecentActivity[]> => {
    try {
      // Simple query without complex joins to avoid relation errors
      const { data: announcements } = await supabase
        .from('announcements')
        .select('id, title, created_at, author_id')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: RecentActivity[] = [];

      announcements?.forEach((announcement: Announcement) => {
        activities.push({
          id: announcement.id,
          action: `Created announcement "${announcement.title}"`,
          user: 'User',
          timestamp: new Date(announcement.created_at),
          type: 'announcement'
        });
      });

      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
  }
};

// Announcements API
export const announcementsApi = {
  getAll: async (): Promise<Announcement[]> => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((announcement: any) => ({
        ...announcement,
        author: 'User',
        category: announcement.category as Announcement['category'],
        priority: announcement.priority as Announcement['priority'],
        attachments: []
      }));
    } catch (error) {
      console.error('Error fetching announcements:', error);
      throw error;
    }
  },

  create: async (announcement: Omit<Announcement, 'id' | 'author' | 'created_at' | 'updated_at'>): Promise<Announcement> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('announcements')
        .insert({
          ...announcement,
          author_id: user.id
        })
        .select('*')
        .single();

      if (error) throw error;

      return {
        ...data,
        author: 'User',
        category: data.category as Announcement['category'],
        priority: data.priority as Announcement['priority'],
        attachments: []
      };
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Announcement>): Promise<Announcement> => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      return {
        ...data,
        author: 'User',
        category: data.category as Announcement['category'],
        priority: data.priority as Announcement['priority'],
        attachments: []
      };
    } catch (error) {
      console.error('Error updating announcement:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting announcement:', error);
      throw error;
    }
  }
};

// Students API
export const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map((student: any) => ({
        ...student,
        status: student.status as Student['status']
      })) as Student[];
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  create: async (student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student> => {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert(student)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        status: data.status as Student['status']
      };
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Student>): Promise<Student> => {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        status: data.status as Student['status']
      };
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  }
};

// Documents API
export const documentsApi = {
  getAll: async (): Promise<Document[]> => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        description: doc.description,
        file_url: doc.file_url,
        file_size: doc.file_size,
        file_type: doc.file_type,
        category: doc.category as Document['category'],
        uploaded_by: 'User',
        is_public: doc.is_public,
        created_at: doc.created_at,
        updated_at: doc.updated_at
      })) as Document[];
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  create: async (document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('documents')
        .insert({
          name: document.name,
          description: document.description,
          file_url: document.file_url,
          file_size: document.file_size,
          file_type: document.file_type,
          category: document.category,
          uploaded_by: userData.user.id,
          is_public: document.is_public
        })
        .select('*')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        file_url: data.file_url,
        file_size: data.file_size,
        file_type: data.file_type,
        category: data.category as Document['category'],
        uploaded_by: 'User',
        is_public: data.is_public,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Document>): Promise<Document> => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        file_url: data.file_url,
        file_size: data.file_size,
        file_type: data.file_type,
        category: data.category as Document['category'],
        uploaded_by: 'User',
        is_public: data.is_public,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

};