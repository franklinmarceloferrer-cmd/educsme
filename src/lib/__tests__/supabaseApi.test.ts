import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseApi } from '../supabaseApi';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client');

describe('supabaseApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('dashboard operations', () => {
    it('should fetch dashboard stats', async () => {
      const mockStats = {
        totalStudents: 150,
        totalTeachers: 12,
        totalAnnouncements: 5,
        totalDocuments: 45,
      };

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockStats, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      const result = await supabaseApi.getDashboardStats();

      expect(result).toEqual(mockStats);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  describe('announcement operations', () => {
    it('should fetch announcements', async () => {
      const mockAnnouncements = [
        {
          id: '1',
          title: 'Test Announcement',
          content: 'Test content',
          priority: 'high',
          author_id: '1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockAnnouncements, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      const result = await supabaseApi.getAnnouncements();

      expect(result).toEqual(mockAnnouncements);
      expect(supabase.from).toHaveBeenCalledWith('announcements');
    });

    it('should create announcement', async () => {
      const newAnnouncement = {
        title: 'New Announcement',
        content: 'New content',
        priority: 'medium' as const,
        author_id: '1',
      };

      const createdAnnouncement = {
        id: '2',
        ...newAnnouncement,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockFromChain = {
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: createdAnnouncement, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      const result = await supabaseApi.createAnnouncement(newAnnouncement);

      expect(result).toEqual(createdAnnouncement);
      expect(mockFromChain.insert).toHaveBeenCalledWith(newAnnouncement);
    });
  });

  describe('student operations', () => {
    it('should fetch students', async () => {
      const mockStudents = [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          phone: '123-456-7890',
          address: '123 Main St',
          enrollment_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const mockFromChain = {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockStudents, error: null }),
      };

      (supabase.from as any).mockReturnValue(mockFromChain);

      const result = await supabaseApi.getStudents();

      expect(result).toEqual(mockStudents);
      expect(supabase.from).toHaveBeenCalledWith('students');
    });
  });
});