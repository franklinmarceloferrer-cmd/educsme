# 🎓 EduCMS - Educational Content Management System

A modern React-based Educational CMS demonstrating full-stack development patterns, API-ready architecture, and professional UI/UX design.

## ✨ Features

### 🎯 Core Functionality
- **Dashboard Analytics** - Real-time statistics and activity monitoring
- **Announcements Management** - Complete CRUD operations with categories
- **Student Directory** - User management with role-based permissions  
- **Document Library** - File management with categorization
- **Reports Generation** - Export capabilities (CSV, Print-ready)

### 🎨 Modern UI/UX
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Dark/Light Theme** - System preference detection with manual toggle
- **Professional Components** - Radix UI primitives with custom styling
- **Role-Based Access** - Admin, Teacher, Student permission levels

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:5173
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with design system tokens
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: React Query + Context API
- **Forms**: React Hook Form with Zod validation

### API Integration Ready
The mock API layer in `src/lib/mockApi.ts` demonstrates expected .NET backend endpoints:

```typescript
GET    /api/announcements
POST   /api/announcements  
GET    /api/students
POST   /api/students
GET    /api/documents
GET    /api/dashboard/stats
```

## 🎯 Demo Features

### Role Switching
Click user profile in sidebar to switch between:
- **Admin**: Full access to all features
- **Teacher**: Can manage announcements and documents  
- **Student**: Read-only access to content

### Export Functionality
- CSV export for student reports
- Print-friendly report layouts
- Session data persistence

## 🔌 .NET Backend Integration

Replace mock API calls with actual HTTP requests to your ASP.NET endpoints. The component structure and state management will remain the same.

---

**Portfolio Project**: Demonstrates modern React patterns and prepares for .NET backend integration.