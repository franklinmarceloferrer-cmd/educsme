# EduCMS Architecture Guide

## 🏗️ **System Architecture Overview**

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Supabase      │    │   Storage       │
│   React + TS    │◄──►│   PostgreSQL    │◄──►│   File System   │
│   Vite + SWC    │    │   Auth + RLS    │    │   (Supabase)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC compiler
- **Styling**: Tailwind CSS with CSS Variables
- **UI Components**: Radix UI primitives + shadcn/ui
- **State Management**: React Query + Context API
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation

#### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (JWT-based)
- **File Storage**: Supabase Storage
- **Real-time**: Supabase Real-time subscriptions
- **Security**: Row Level Security (RLS) policies

#### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with TypeScript rules
- **Type Checking**: TypeScript strict mode
- **Code Formatting**: Built-in Vite formatting

## 📁 **Project Structure**

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components (Header, Sidebar)
│   ├── announcements/   # Announcement-specific components
│   └── students/        # Student-specific components
├── contexts/            # React Context providers
│   └── AuthContext.tsx  # Authentication context
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client and types
├── lib/                 # Utility functions and APIs
│   ├── utils.ts         # General utilities
│   ├── supabaseApi.ts   # Supabase API functions
│   ├── fileStorage.ts   # File storage service
│   └── setupStorage.ts  # Storage initialization
├── pages/               # Page components
│   ├── Dashboard.tsx
│   ├── Announcements.tsx
│   ├── Students.tsx
│   ├── Documents.tsx
│   ├── Reports.tsx
│   └── Login.tsx
└── main.tsx             # Application entry point
```

## 🔐 **Security Architecture**

### Authentication Flow
```
1. User Login → Supabase Auth → JWT Token
2. Token Storage → localStorage (persistent sessions)
3. API Requests → Authorization header with JWT
4. Token Refresh → Automatic via Supabase client
```

### Row Level Security (RLS)
```sql
-- Example: Announcements table policy
CREATE POLICY "Teachers can create announcements" 
ON announcements FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('teacher', 'admin')
  )
);
```

### Role-Based Access Control
- **Admin**: Full system access
- **Teacher**: Manage announcements, students, documents
- **Student**: Read-only access to published content

## 📊 **Data Flow Architecture**

### State Management Pattern
```
Component → React Query → Supabase API → PostgreSQL
    ↓           ↓              ↓            ↓
  UI State → Cache Layer → HTTP Layer → Database
```

### Data Fetching Strategy
1. **React Query**: Client-side caching and synchronization
2. **Optimistic Updates**: UI updates before API confirmation
3. **Background Refetching**: Automatic data freshness
4. **Error Boundaries**: Graceful error handling

### Real-time Data Flow (Planned)
```
Database Change → Supabase Real-time → WebSocket → React Query → UI Update
```

## 🎨 **UI/UX Architecture**

### Design System
- **Color Scheme**: CSS custom properties for theming
- **Typography**: System font stack with fallbacks
- **Spacing**: Tailwind's spacing scale (4px base unit)
- **Components**: Consistent Radix UI primitives

### Theme System
```typescript
// Theme Provider manages:
- Light/Dark mode toggle
- System preference detection
- Persistent theme storage
- CSS variable updates
```

### Responsive Design
- **Mobile First**: Base styles for mobile, scale up
- **Breakpoints**: Tailwind's default breakpoints
- **Grid System**: CSS Grid and Flexbox
- **Touch Targets**: Minimum 44px for interactive elements

## 🔄 **Component Architecture**

### Component Hierarchy
```
App
├── AuthProvider (Context)
├── ThemeProvider (Context)
├── QueryClientProvider (React Query)
└── Router
    ├── ProtectedRoute
    │   └── AppLayout
    │       ├── AppSidebar
    │       ├── Header
    │       └── Page Components
    └── Login (Public Route)
```

### Component Patterns
1. **Container/Presentational**: Logic vs. UI separation
2. **Compound Components**: Related components grouped together
3. **Render Props**: Flexible component composition
4. **Custom Hooks**: Reusable stateful logic

### Form Architecture
```typescript
// Pattern: React Hook Form + Zod
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: {...}
});

// Validation schema
const schema = z.object({
  field: z.string().min(1, "Required")
});
```

## 📡 **API Architecture**

### API Layer Structure
```
Frontend Components
       ↓
React Query Hooks
       ↓
API Functions (supabaseApi.ts)
       ↓
Supabase Client
       ↓
PostgreSQL Database
```

### Error Handling Strategy
```typescript
// Centralized error handling
try {
  const { data, error } = await supabaseCall();
  if (error) throw error;
  return data;
} catch (error) {
  // Log error
  // Show user-friendly message
  // Trigger error boundary if needed
}
```

## 🚀 **Performance Architecture**

### Optimization Strategies
1. **Code Splitting**: Route-based lazy loading
2. **Bundle Optimization**: Vite's automatic optimizations
3. **Image Optimization**: Lazy loading and responsive images
4. **Caching**: React Query for API responses
5. **Memoization**: React.memo and useMemo for expensive operations

### Build Optimization
```typescript
// Vite configuration
export default defineConfig({
  plugins: [react(), componentTagger()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-*']
        }
      }
    }
  }
});
```

## 🧪 **Testing Architecture (Planned)**

### Testing Strategy
```
Unit Tests (Vitest)
├── Utility functions
├── Custom hooks
└── API functions

Component Tests (React Testing Library)
├── User interactions
├── Form submissions
└── Data display

Integration Tests
├── Authentication flows
├── CRUD operations
└── File uploads

E2E Tests (Playwright - Future)
├── Complete user journeys
├── Cross-browser testing
└── Performance testing
```

## 📦 **Deployment Architecture**

### Current Setup
- **Development**: Vite dev server (localhost:8080)
- **Build**: Static files generated by Vite
- **Preview**: Vite preview server

### Production Deployment (Recommended)
```
Source Code → GitHub → Vercel/Netlify → CDN → Users
     ↓           ↓         ↓           ↓       ↓
   Git Push → CI/CD → Build → Deploy → Serve
```

### Environment Configuration
```typescript
// Environment variables
VITE_SUPABASE_URL=https://project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

## 🔧 **Development Workflow**

### Local Development
1. `npm install` - Install dependencies
2. `npm run dev` - Start development server
3. `npm run lint` - Run ESLint
4. `npm run build` - Build for production

### Code Quality
- **TypeScript**: Strict type checking
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (via ESLint)
- **Husky**: Git hooks for quality checks (to be added)

## 📈 **Scalability Considerations**

### Current Limitations
- Single Supabase instance
- Client-side routing only
- No CDN for assets
- Limited caching strategy

### Future Scalability
1. **Database**: Read replicas for heavy read workloads
2. **CDN**: Asset distribution for global users
3. **Caching**: Redis for session and data caching
4. **Monitoring**: Application performance monitoring
5. **Load Balancing**: Multiple server instances
