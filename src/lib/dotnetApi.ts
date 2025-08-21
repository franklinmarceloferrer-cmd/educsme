// .NET API Client for EduCMS
// This provides an alternative backend implementation to Supabase

const API_BASE_URL = import.meta.env.VITE_DOTNET_API_URL || 'http://localhost:5000/api/v1';

// Types matching the .NET API DTOs
export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  grade: string;
  section: string;
  enrollmentDate: string;
  status: StudentStatus;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentRequest {
  studentId: string;
  name: string;
  email: string;
  grade: string;
  section: string;
  enrollmentDate?: string;
  status?: StudentStatus;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  notes?: string;
}

export interface UpdateStudentRequest {
  studentId: string;
  name: string;
  email: string;
  grade: string;
  section: string;
  status: StudentStatus;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  emergencyContact?: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  authorId: string;
  authorName: string;
  isPublished: boolean;
  publishDate?: string;
  expiryDate?: string;
  targetAudience?: string;
  isPinned: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  contentType: string;
  fileSize: number;
  category: DocumentCategory;
  accessLevel: DocumentAccessLevel;
  uploadedById: string;
  uploadedByName: string;
  downloadCount: number;
  tags?: string;
  version: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum StudentStatus {
  Active = 1,
  Inactive = 2,
  Suspended = 3,
  Graduated = 4,
  Transferred = 5,
  Withdrawn = 6
}

export enum AnnouncementCategory {
  General = 1,
  Academic = 2,
  Administrative = 3,
  Events = 4,
  Emergency = 5,
  Maintenance = 6,
  Policy = 7
}

export enum AnnouncementPriority {
  Low = 1,
  Normal = 2,
  High = 3,
  Critical = 4
}

export enum DocumentCategory {
  General = 1,
  Academic = 2,
  Administrative = 3,
  Policy = 4,
  Forms = 5,
  Reports = 6,
  Presentations = 7,
  Images = 8,
  Videos = 9,
  Audio = 10
}

export enum DocumentAccessLevel {
  Public = 1,
  Internal = 2,
  Restricted = 3,
  Confidential = 4
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: string;
}

interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

class ApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Students API
  async getStudents(params: {
    pageNumber?: number;
    pageSize?: number;
    searchTerm?: string;
    grade?: string;
    status?: StudentStatus;
  } = {}): Promise<PagedResponse<Student>> {
    const searchParams = new URLSearchParams();
    
    if (params.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.searchTerm) searchParams.append('searchTerm', params.searchTerm);
    if (params.grade) searchParams.append('grade', params.grade);
    if (params.status !== undefined) searchParams.append('status', params.status.toString());

    const response = await this.request<PagedResponse<Student>>(
      `/students?${searchParams.toString()}`
    );
    
    return response.data!;
  }

  async getStudent(id: string): Promise<Student> {
    const response = await this.request<Student>(`/students/${id}`);
    return response.data!;
  }

  async createStudent(student: CreateStudentRequest): Promise<Student> {
    const response = await this.request<Student>('/students', {
      method: 'POST',
      body: JSON.stringify(student),
    });
    return response.data!;
  }

  async updateStudent(id: string, student: UpdateStudentRequest): Promise<Student> {
    const response = await this.request<Student>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student),
    });
    return response.data!;
  }

  async deleteStudent(id: string): Promise<void> {
    await this.request(`/students/${id}`, {
      method: 'DELETE',
    });
  }

  async updateStudentAvatar(id: string, avatarUrl: string): Promise<void> {
    await this.request(`/students/${id}/avatar`, {
      method: 'PATCH',
      body: JSON.stringify({ avatarUrl }),
    });
  }

  // Health Check
  async healthCheck(): Promise<any> {
    const response = await fetch(`${this.baseUrl.replace('/api/v1', '')}/health`);
    return response.json();
  }
}

// Create and export the API client instance
export const dotnetApiClient = new ApiClient(API_BASE_URL);

// Students API wrapper to match existing Supabase API interface
export const studentsApi = {
  async getAll(): Promise<Student[]> {
    const result = await dotnetApiClient.getStudents({ pageSize: 1000 });
    return result.items;
  },

  async getById(id: string): Promise<Student | null> {
    try {
      return await dotnetApiClient.getStudent(id);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  async create(student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<Student> {
    const createRequest: CreateStudentRequest = {
      studentId: student.studentId,
      name: student.name,
      email: student.email,
      grade: student.grade,
      section: student.section,
      enrollmentDate: student.enrollmentDate,
      status: student.status,
      phoneNumber: student.phoneNumber,
      address: student.address,
      dateOfBirth: student.dateOfBirth,
      emergencyContact: student.emergencyContact,
      notes: student.notes,
    };
    return await dotnetApiClient.createStudent(createRequest);
  },

  async update(id: string, student: Partial<Student>): Promise<Student> {
    const existing = await dotnetApiClient.getStudent(id);
    const updateRequest: UpdateStudentRequest = {
      studentId: student.studentId || existing.studentId,
      name: student.name || existing.name,
      email: student.email || existing.email,
      grade: student.grade || existing.grade,
      section: student.section || existing.section,
      status: student.status || existing.status,
      phoneNumber: student.phoneNumber !== undefined ? student.phoneNumber : existing.phoneNumber,
      address: student.address !== undefined ? student.address : existing.address,
      dateOfBirth: student.dateOfBirth !== undefined ? student.dateOfBirth : existing.dateOfBirth,
      emergencyContact: student.emergencyContact !== undefined ? student.emergencyContact : existing.emergencyContact,
      notes: student.notes !== undefined ? student.notes : existing.notes,
    };
    return await dotnetApiClient.updateStudent(id, updateRequest);
  },

  async delete(id: string): Promise<void> {
    await dotnetApiClient.deleteStudent(id);
  },

  async updateAvatar(id: string, avatarUrl: string): Promise<void> {
    await dotnetApiClient.updateStudentAvatar(id, avatarUrl);
  },
};
