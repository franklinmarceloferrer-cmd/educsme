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

export interface StudentInvite {
  id: string;
  email: string;
  student_id: string | null;
  name: string;
  grade: string;
  section: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invited_by: string | null;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  email: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Users API (Admin only)
export const usersApi = {
  getAll: async (): Promise<Profile[]> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  updateRole: async (userId: string, newRole: string): Promise<void> => {
    try {
      const { error } = await supabase.rpc('update_user_role', {
        target_user_id: userId,
        new_role: newRole,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },
};

// Student Dashboard Data
export interface StudentDashboardData {
  recentAnnouncements: Announcement[];
  recentDocuments: Document[];
  urgentAnnouncements: Announcement[];
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
        role_name: 'teacher' 
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

      announcements?.forEach((announcement: any) => {
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
  },

  getStudentDashboard: async (): Promise<StudentDashboardData> => {
    try {
      const [announcementsResult, documentsResult, urgentResult] = await Promise.all([
        // Recent published announcements
        supabase
          .from('announcements')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(5),
        // Recent public documents
        supabase
          .from('documents')
          .select('*')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(5),
        // Urgent announcements
        supabase
          .from('announcements')
          .select('*')
          .eq('is_published', true)
          .eq('category', 'urgent')
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      const mapAnnouncement = (a: any): Announcement => ({
        ...a,
        author: 'User',
        category: a.category as Announcement['category'],
        priority: a.priority as Announcement['priority'],
        attachments: []
      });

      const mapDocument = (d: any): Document => ({
        id: d.id,
        name: d.name,
        description: d.description,
        file_url: d.file_url,
        file_size: d.file_size,
        file_type: d.file_type,
        category: d.category as Document['category'],
        uploaded_by: 'User',
        is_public: d.is_public,
        created_at: d.created_at,
        updated_at: d.updated_at
      });

      return {
        recentAnnouncements: (announcementsResult.data || []).map(mapAnnouncement),
        recentDocuments: (documentsResult.data || []).map(mapDocument),
        urgentAnnouncements: (urgentResult.data || []).map(mapAnnouncement)
      };
    } catch (error) {
      console.error('Error fetching student dashboard:', error);
      return {
        recentAnnouncements: [],
        recentDocuments: [],
        urgentAnnouncements: []
      };
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

// Student Invites API
export const invitesApi = {
  getAll: async (): Promise<StudentInvite[]> => {
    try {
      const { data, error } = await supabase
        .from('student_invites')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as StudentInvite[];
    } catch (error) {
      console.error('Error fetching invites:', error);
      throw error;
    }
  },

  create: async (invite: {
    email: string;
    name: string;
    grade: string;
    section: string;
    student_id?: string;
  }): Promise<StudentInvite> => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      // Check if email already has a pending invite
      const { data: existingInvite } = await supabase
        .from('student_invites')
        .select('id')
        .eq('email', invite.email)
        .eq('status', 'pending')
        .single();

      if (existingInvite) {
        throw new Error('Já existe um convite pendente para este email');
      }

      const { data, error } = await supabase
        .from('student_invites')
        .insert({
          ...invite,
          invited_by: userData.user.id,
        })
        .select('*')
        .single();

      if (error) throw error;
      return data as StudentInvite;
    } catch (error) {
      console.error('Error creating invite:', error);
      throw error;
    }
  },

  revoke: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('student_invites')
        .update({ status: 'revoked' })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error revoking invite:', error);
      throw error;
    }
  },

  getByToken: async (token: string): Promise<StudentInvite | null> => {
    try {
      const { data, error } = await supabase
        .from('student_invites')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows found
        throw error;
      }
      return data as StudentInvite;
    } catch (error) {
      console.error('Error fetching invite by token:', error);
      return null;
    }
  },
};