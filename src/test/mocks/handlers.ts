import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Supabase API endpoints
  http.get('*/rest/v1/profiles', () => {
    return HttpResponse.json([
      {
        id: '1',
        user_id: '1',
        display_name: 'Test User',
        email: 'test@example.com',
        role: 'admin',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }),

  http.get('*/rest/v1/announcements', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: 'Test Announcement',
        content: 'This is a test announcement',
        priority: 'high',
        author_id: '1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }),

  http.get('*/rest/v1/students', () => {
    return HttpResponse.json([
      {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        address: '123 Main St',
        enrollment_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);
  }),
];