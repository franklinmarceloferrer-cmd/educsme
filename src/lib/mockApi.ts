// Mock API for Educational CMS - ready to be replaced with real .NET API calls

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  category: 'general' | 'academic' | 'events' | 'urgent';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  enrollmentDate: string;
  status: 'active' | 'inactive';
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
  category: 'syllabus' | 'assignment' | 'resource' | 'form';
}

// Mock data storage
let mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Welcome to the New Academic Year',
    content: 'We are excited to welcome all students back for another year of learning and growth.',
    author: 'Admin User',
    authorId: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isPublished: true,
    category: 'general',
  },
  {
    id: '2',
    title: 'Mid-term Examination Schedule',
    content: 'Please review the updated mid-term examination schedule. All exams will be held in the main auditorium.',
    author: 'Teacher User',
    authorId: '2',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    isPublished: true,
    category: 'academic',
  },
  {
    id: '3',
    title: 'Science Fair Registration Open',
    content: 'Registration for the annual science fair is now open. Submit your projects by March 1st.',
    author: 'Admin User',
    authorId: '1',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z',
    isPublished: true,
    category: 'events',
  },
];

let mockStudents: Student[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@student.edu',
    grade: '10th Grade',
    enrollmentDate: '2023-09-01',
    status: 'active',
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@student.edu',
    grade: '11th Grade',
    enrollmentDate: '2022-09-01',
    status: 'active',
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol.davis@student.edu',
    grade: '12th Grade',
    enrollmentDate: '2021-09-01',
    status: 'active',
  },
];

let mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Course Syllabus - Mathematics',
    type: 'PDF',
    size: 1024000,
    uploadedBy: 'Teacher User',
    uploadedAt: '2024-01-10T10:00:00Z',
    category: 'syllabus',
  },
  {
    id: '2',
    name: 'Assignment Guidelines',
    type: 'DOCX',
    size: 512000,
    uploadedBy: 'Teacher User',
    uploadedAt: '2024-01-15T14:00:00Z',
    category: 'assignment',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Announcements API
export const announcementsApi = {
  getAll: async (): Promise<Announcement[]> => {
    await delay(500);
    return [...mockAnnouncements].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getById: async (id: string): Promise<Announcement | null> => {
    await delay(300);
    return mockAnnouncements.find(a => a.id === id) || null;
  },

  create: async (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement> => {
    await delay(500);
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAnnouncements.push(newAnnouncement);
    return newAnnouncement;
  },

  update: async (id: string, updates: Partial<Announcement>): Promise<Announcement> => {
    await delay(500);
    const index = mockAnnouncements.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Announcement not found');
    
    mockAnnouncements[index] = {
      ...mockAnnouncements[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return mockAnnouncements[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    mockAnnouncements = mockAnnouncements.filter(a => a.id !== id);
  },
};

// Students API
export const studentsApi = {
  getAll: async (): Promise<Student[]> => {
    await delay(500);
    return [...mockStudents];
  },

  getById: async (id: string): Promise<Student | null> => {
    await delay(300);
    return mockStudents.find(s => s.id === id) || null;
  },

  create: async (student: Omit<Student, 'id'>): Promise<Student> => {
    await delay(500);
    const newStudent: Student = {
      ...student,
      id: Date.now().toString(),
    };
    mockStudents.push(newStudent);
    return newStudent;
  },

  update: async (id: string, updates: Partial<Student>): Promise<Student> => {
    await delay(500);
    const index = mockStudents.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student not found');
    
    mockStudents[index] = { ...mockStudents[index], ...updates };
    return mockStudents[index];
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    mockStudents = mockStudents.filter(s => s.id !== id);
  },
};

// Documents API
export const documentsApi = {
  getAll: async (): Promise<Document[]> => {
    await delay(500);
    return [...mockDocuments];
  },

  upload: async (file: File, category: Document['category'], uploadedBy: string): Promise<Document> => {
    await delay(1000); // Simulate upload time
    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedBy,
      uploadedAt: new Date().toISOString(),
      category,
    };
    mockDocuments.push(newDocument);
    return newDocument;
  },

  delete: async (id: string): Promise<void> => {
    await delay(300);
    mockDocuments = mockDocuments.filter(d => d.id !== id);
  },
};

// Dashboard Statistics API
export const dashboardApi = {
  getStats: async () => {
    await delay(500);
    return {
      totalStudents: mockStudents.length,
      totalAnnouncements: mockAnnouncements.length,
      totalDocuments: mockDocuments.length,
      activeAnnouncements: mockAnnouncements.filter(a => a.isPublished).length,
    };
  },

  getRecentActivity: async () => {
    await delay(300);
    return [
      { id: '1', action: 'New announcement published', timestamp: '2024-02-01T10:00:00Z', user: 'Admin User' },
      { id: '2', action: 'Student enrolled', timestamp: '2024-01-30T14:30:00Z', user: 'Admin User' },
      { id: '3', action: 'Document uploaded', timestamp: '2024-01-29T09:15:00Z', user: 'Teacher User' },
    ];
  },
};