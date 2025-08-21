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

### **Frontend Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:5173
```

### **.NET Backend Setup (Optional)**
```bash
# Navigate to backend directory
cd backend

# Restore .NET dependencies
dotnet restore

# Update database (uses LocalDB by default)
cd EduCMS.Api
dotnet ef database update

# Start the API
dotnet run

# API available at http://localhost:5000
# Swagger UI at http://localhost:5000
```

### **Docker Development (Full Stack)**
```bash
# Start both frontend and backend with Docker
cd backend
docker-compose up -d

# Frontend: http://localhost:3000 (if configured)
# API: http://localhost:5000
# SQL Server: localhost:1433
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with design system tokens
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: React Query + Context API
- **Forms**: React Hook Form with Zod validation

### Backend Architecture - Dual Implementation

**Full-Stack Development Showcase**: The application supports two backend implementations, demonstrating both modern BaaS and enterprise API development:

#### **Option 1: Supabase Backend (Default)**
```typescript
// Supabase BaaS Implementation
- Authentication: Supabase Auth with JWT tokens
- Database: PostgreSQL with Row Level Security (RLS)
- Storage: Supabase Storage for file uploads
- Real-time: WebSocket subscriptions
```

#### **Option 2: .NET Core API Backend (Enterprise)**
```csharp
// ASP.NET Core Web API Implementation
- Architecture: Clean Architecture with SOLID principles
- Database: SQL Server with Entity Framework Core
- Authentication: JWT Bearer tokens (compatible with frontend)
- Patterns: Repository, Unit of Work, Dependency Injection
- Documentation: Swagger/OpenAPI with comprehensive examples
- Deployment: Docker containerization with health checks
```

**Switch Between Backends**: Set `VITE_USE_DOTNET_API=true` to use the .NET backend

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

## 📚 Documentation

### **Frontend Documentation**
- [Azure Deployment Guide](docs/azure-deployment-guide.md) - Complete deployment to Azure App Service
- [Interview Demo Guide](docs/interview-demo-guide.md) - Structured presentation for technical interviews
- [Troubleshooting Guide](docs/troubleshooting-guide.md) - Common issues and solutions
- [Production Deployment Checklist](docs/production-deployment-checklist.md) - Verification steps

### **Backend Documentation**
- [.NET Backend README](backend/README.md) - Complete backend setup and architecture guide
- [Backend Integration Guide](docs/dotnet-backend-integration.md) - Full-stack development showcase
- [API Documentation](http://localhost:5000) - Swagger UI (when backend is running)

### **Architecture & Patterns**
- **Clean Architecture**: Separation of concerns with proper layering
- **Repository Pattern**: Generic repository with Unit of Work
- **CQRS Ready**: Command Query Responsibility Segregation structure
- **Enterprise Patterns**: Dependency Injection, AutoMapper, FluentValidation

## 🎯 **Interview Readiness**

This project demonstrates:

### **Frontend Expertise**
- Modern React 18 patterns and TypeScript proficiency
- Component architecture with reusable UI library
- State management with React Query and Context API
- Performance optimization and responsive design

### **Backend Expertise**
- Clean Architecture implementation with .NET Core
- Entity Framework Core with advanced configurations
- RESTful API design with comprehensive documentation
- Docker containerization and deployment strategies

### **Full-Stack Integration**
- API abstraction layer for backend flexibility
- Seamless switching between Supabase and .NET backends
- Consistent data models and error handling
- Enterprise-grade security and authentication

### **DevOps & Deployment**
- Complete CI/CD pipelines with GitHub Actions
- Docker containerization with multi-stage builds
- Health checks and monitoring implementation
- Azure cloud deployment with proper configuration

---

**Built with ❤️ for educational institutions and technical interviews - showcasing full-stack development expertise**