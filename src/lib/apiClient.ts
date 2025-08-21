// API Client Abstraction Layer
// This allows switching between Supabase and .NET API backends

import { studentsApi as supabaseStudentsApi, type Student as SupabaseStudent } from './supabaseApi';
import { studentsApi as dotnetStudentsApi, type Student as DotnetStudent } from './dotnetApi';

// Environment variable to control which backend to use
const USE_DOTNET_API = import.meta.env.VITE_USE_DOTNET_API === 'true';

// Unified Student interface (compatible with both backends)
export interface Student {
  id: string;
  student_id?: string; // Supabase format
  studentId?: string;  // .NET format
  name: string;
  email: string;
  grade: string;
  section: string;
  enrollment_date?: string; // Supabase format
  enrollmentDate?: string;  // .NET format
  status: string | number;
  avatar_url?: string; // Supabase format
  avatarUrl?: string;  // .NET format
  phone_number?: string; // Supabase format
  phoneNumber?: string;  // .NET format
  address?: string;
  date_of_birth?: string; // Supabase format
  dateOfBirth?: string;   // .NET format
  emergency_contact?: string; // Supabase format
  emergencyContact?: string;  // .NET format
  notes?: string;
  created_at?: string; // Supabase format
  createdAt?: string;  // .NET format
  updated_at?: string; // Supabase format
  updatedAt?: string;  // .NET format
}

// Transform functions to normalize data between backends
function normalizeStudent(student: SupabaseStudent | DotnetStudent): Student {
  if (USE_DOTNET_API) {
    const dotnetStudent = student as DotnetStudent;
    return {
      id: dotnetStudent.id,
      studentId: dotnetStudent.studentId,
      student_id: dotnetStudent.studentId, // For compatibility
      name: dotnetStudent.name,
      email: dotnetStudent.email,
      grade: dotnetStudent.grade,
      section: dotnetStudent.section,
      enrollmentDate: dotnetStudent.enrollmentDate,
      enrollment_date: dotnetStudent.enrollmentDate, // For compatibility
      status: dotnetStudent.status,
      avatarUrl: dotnetStudent.avatarUrl,
      avatar_url: dotnetStudent.avatarUrl, // For compatibility
      phoneNumber: dotnetStudent.phoneNumber,
      phone_number: dotnetStudent.phoneNumber, // For compatibility
      address: dotnetStudent.address,
      dateOfBirth: dotnetStudent.dateOfBirth,
      date_of_birth: dotnetStudent.dateOfBirth, // For compatibility
      emergencyContact: dotnetStudent.emergencyContact,
      emergency_contact: dotnetStudent.emergencyContact, // For compatibility
      notes: dotnetStudent.notes,
      createdAt: dotnetStudent.createdAt,
      created_at: dotnetStudent.createdAt, // For compatibility
      updatedAt: dotnetStudent.updatedAt,
      updated_at: dotnetStudent.updatedAt, // For compatibility
    };
  } else {
    const supabaseStudent = student as SupabaseStudent;
    return {
      id: supabaseStudent.id,
      student_id: supabaseStudent.student_id,
      studentId: supabaseStudent.student_id, // For compatibility
      name: supabaseStudent.name,
      email: supabaseStudent.email,
      grade: supabaseStudent.grade,
      section: supabaseStudent.section,
      enrollment_date: supabaseStudent.enrollment_date,
      enrollmentDate: supabaseStudent.enrollment_date, // For compatibility
      status: supabaseStudent.status,
      avatar_url: supabaseStudent.avatar_url,
      avatarUrl: supabaseStudent.avatar_url, // For compatibility
      phone_number: supabaseStudent.phone_number,
      phoneNumber: supabaseStudent.phone_number, // For compatibility
      address: supabaseStudent.address,
      date_of_birth: supabaseStudent.date_of_birth,
      dateOfBirth: supabaseStudent.date_of_birth, // For compatibility
      emergency_contact: supabaseStudent.emergency_contact,
      emergencyContact: supabaseStudent.emergency_contact, // For compatibility
      notes: supabaseStudent.notes,
      created_at: supabaseStudent.created_at,
      createdAt: supabaseStudent.created_at, // For compatibility
      updated_at: supabaseStudent.updated_at,
      updatedAt: supabaseStudent.updated_at, // For compatibility
    };
  }
}

function denormalizeStudentForCreate(student: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'createdAt' | 'updatedAt'>): any {
  if (USE_DOTNET_API) {
    return {
      studentId: student.studentId || student.student_id,
      name: student.name,
      email: student.email,
      grade: student.grade,
      section: student.section,
      enrollmentDate: student.enrollmentDate || student.enrollment_date,
      status: student.status,
      phoneNumber: student.phoneNumber || student.phone_number,
      address: student.address,
      dateOfBirth: student.dateOfBirth || student.date_of_birth,
      emergencyContact: student.emergencyContact || student.emergency_contact,
      notes: student.notes,
    };
  } else {
    return {
      student_id: student.student_id || student.studentId,
      name: student.name,
      email: student.email,
      grade: student.grade,
      section: student.section,
      enrollment_date: student.enrollment_date || student.enrollmentDate,
      status: student.status,
      phone_number: student.phone_number || student.phoneNumber,
      address: student.address,
      date_of_birth: student.date_of_birth || student.dateOfBirth,
      emergency_contact: student.emergency_contact || student.emergencyContact,
      notes: student.notes,
    };
  }
}

function denormalizeStudentForUpdate(student: Partial<Student>): any {
  if (USE_DOTNET_API) {
    return {
      studentId: student.studentId || student.student_id,
      name: student.name,
      email: student.email,
      grade: student.grade,
      section: student.section,
      status: student.status,
      phoneNumber: student.phoneNumber || student.phone_number,
      address: student.address,
      dateOfBirth: student.dateOfBirth || student.date_of_birth,
      emergencyContact: student.emergencyContact || student.emergency_contact,
      notes: student.notes,
    };
  } else {
    return {
      student_id: student.student_id || student.studentId,
      name: student.name,
      email: student.email,
      grade: student.grade,
      section: student.section,
      status: student.status,
      phone_number: student.phone_number || student.phoneNumber,
      address: student.address,
      date_of_birth: student.date_of_birth || student.dateOfBirth,
      emergency_contact: student.emergency_contact || student.emergencyContact,
      notes: student.notes,
    };
  }
}

// Unified API interface
export const studentsApi = {
  async getAll(): Promise<Student[]> {
    const api = USE_DOTNET_API ? dotnetStudentsApi : supabaseStudentsApi;
    const students = await api.getAll();
    return students.map(normalizeStudent);
  },

  async getById(id: string): Promise<Student | null> {
    const api = USE_DOTNET_API ? dotnetStudentsApi : supabaseStudentsApi;
    const student = await api.getById(id);
    return student ? normalizeStudent(student) : null;
  },

  async create(student: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'createdAt' | 'updatedAt'>): Promise<Student> {
    const api = USE_DOTNET_API ? dotnetStudentsApi : supabaseStudentsApi;
    const denormalizedStudent = denormalizeStudentForCreate(student);
    const createdStudent = await api.create(denormalizedStudent);
    return normalizeStudent(createdStudent);
  },

  async update(id: string, student: Partial<Student>): Promise<Student> {
    const api = USE_DOTNET_API ? dotnetStudentsApi : supabaseStudentsApi;
    const denormalizedStudent = denormalizeStudentForUpdate(student);
    const updatedStudent = await api.update(id, denormalizedStudent);
    return normalizeStudent(updatedStudent);
  },

  async delete(id: string): Promise<void> {
    const api = USE_DOTNET_API ? dotnetStudentsApi : supabaseStudentsApi;
    await api.delete(id);
  },

  async updateAvatar(id: string, avatarUrl: string): Promise<void> {
    const api = USE_DOTNET_API ? dotnetStudentsApi : supabaseStudentsApi;
    await api.updateAvatar(id, avatarUrl);
  },
};

// Export the backend type for debugging/logging
export const getCurrentBackend = () => USE_DOTNET_API ? '.NET API' : 'Supabase';

// Health check function
export const healthCheck = async (): Promise<{ backend: string; status: string; details?: any }> => {
  try {
    if (USE_DOTNET_API) {
      const { dotnetApiClient } = await import('./dotnetApi');
      const health = await dotnetApiClient.healthCheck();
      return {
        backend: '.NET API',
        status: 'healthy',
        details: health
      };
    } else {
      // For Supabase, we can check if we can make a simple query
      const students = await supabaseStudentsApi.getAll();
      return {
        backend: 'Supabase',
        status: 'healthy',
        details: { studentCount: students.length }
      };
    }
  } catch (error) {
    return {
      backend: USE_DOTNET_API ? '.NET API' : 'Supabase',
      status: 'unhealthy',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
};

// Re-export other APIs (these would need similar abstraction for full implementation)
export { announcementsApi, documentsApi } from './supabaseApi';
