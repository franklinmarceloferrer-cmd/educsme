# EduCMS .NET Backend API

A comprehensive ASP.NET Core Web API backend for the EduCMS (Educational Content Management System) that demonstrates enterprise-grade development patterns and practices.

## 🏗️ **Architecture Overview**

This backend implementation follows **Clean Architecture** principles with clear separation of concerns:

```
EduCMS.Api/                 # Presentation Layer (Controllers, DTOs, Middleware)
├── Controllers/            # API Controllers
├── Models/                 # Data Transfer Objects (DTOs)
├── Mappings/              # AutoMapper Profiles
└── Program.cs             # Application Entry Point

EduCMS.Core/               # Business Logic Layer (Entities, Interfaces, Services)
├── Entities/              # Domain Entities
├── Interfaces/            # Service and Repository Interfaces
└── Services/              # Business Logic Services

EduCMS.Infrastructure/     # Data Access Layer (EF Core, Repositories)
├── Data/                  # DbContext and Configurations
├── Repositories/          # Repository Implementations
└── Configurations/        # Entity Framework Configurations
```

## 🚀 **Key Features**

### **Enterprise Patterns**
- **Clean Architecture** with proper separation of concerns
- **Repository Pattern** with Unit of Work for data access
- **CQRS-ready** structure for future scalability
- **Dependency Injection** throughout the application
- **AutoMapper** for entity-to-DTO mapping

### **Technical Excellence**
- **ASP.NET Core 8.0** (LTS) with modern C# features
- **Entity Framework Core** with SQL Server
- **JWT Authentication** compatible with existing frontend
- **Swagger/OpenAPI** documentation with examples
- **Structured Logging** with Serilog
- **Health Checks** for monitoring and diagnostics

### **Security & Performance**
- **Input Validation** with FluentValidation
- **Global Exception Handling** with proper error responses
- **CORS Configuration** for frontend integration
- **Connection Resilience** with retry policies
- **Soft Delete** implementation for data integrity

## 🛠️ **Technology Stack**

- **Framework**: ASP.NET Core 8.0 (LTS)
- **Database**: SQL Server with Entity Framework Core 8.0
- **Authentication**: JWT Bearer tokens
- **Documentation**: Swagger/OpenAPI 3.0
- **Logging**: Serilog with structured logging
- **Validation**: FluentValidation
- **Mapping**: AutoMapper
- **Testing**: xUnit (planned)
- **Containerization**: Docker with multi-stage builds

## 🚀 **Quick Start**

### **Prerequisites**
- .NET 8.0 SDK
- SQL Server (LocalDB for development)
- Visual Studio 2022 or VS Code
- Docker (optional, for containerized deployment)

### **Local Development Setup**

#### **Prerequisites**
- .NET 8.0 SDK or later
- SQL Server (LocalDB for development)
- Visual Studio 2022, VS Code, or JetBrains Rider

#### **Quick Start (Recommended)**

1. **Navigate to Backend Directory**
   ```bash
   cd backend
   ```

2. **Run Automated Build Script**

   **Windows (PowerShell):**
   ```powershell
   .\restore-and-build.ps1
   ```

   **Linux/macOS (Bash):**
   ```bash
   chmod +x restore-and-build.sh
   ./restore-and-build.sh
   ```

3. **Update Database Connection**
   Edit `EduCMS.Api/appsettings.Development.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=EduCMSDb_Dev;Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true"
     }
   }
   ```

4. **Run Database Migrations**
   ```bash
   cd EduCMS.Api
   dotnet ef database update
   ```

5. **Start the API**
   ```bash
   dotnet run --project EduCMS.Api
   ```

6. **Access Swagger Documentation**
   Open `https://localhost:7001` or `http://localhost:5000`

#### **Manual Setup (Alternative)**

If you prefer manual setup or the automated script doesn't work:

1. **Clean Previous Builds**
   ```bash
   dotnet clean EduCMS.sln
   ```

2. **Clear NuGet Cache**
   ```bash
   dotnet nuget locals all --clear
   ```

3. **Restore Dependencies**
   ```bash
   dotnet restore EduCMS.sln --no-cache
   ```

4. **Build Solution**
   ```bash
   dotnet build EduCMS.sln --configuration Release
   ```

### **Docker Development**

1. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the API**
   - API: `http://localhost:5000`
   - SQL Server: `localhost:1433` (sa/YourStrong@Passw0rd)
   - Redis: `localhost:6379`

## 📊 **API Endpoints**

### **Students API**
```
GET    /api/v1/students              # Get all students (paginated)
GET    /api/v1/students/{id}         # Get student by ID
POST   /api/v1/students              # Create new student
PUT    /api/v1/students/{id}         # Update student
DELETE /api/v1/students/{id}         # Delete student (soft delete)
PATCH  /api/v1/students/{id}/avatar  # Update student avatar
```

### **Health Checks**
```
GET    /health                       # Comprehensive health check
GET    /health/ready                 # Readiness probe
GET    /health/live                  # Liveness probe
```

### **API Documentation**
```
GET    /                            # Swagger UI
GET    /swagger/v1/swagger.json     # OpenAPI specification
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Database
ConnectionStrings__DefaultConnection="Server=...;Database=...;..."

# JWT Authentication
Jwt__Key="YourSecretKeyHere"
Jwt__Issuer="EduCMS.Api"
Jwt__Audience="EduCMS.Client"
Jwt__ExpiryInMinutes="60"

# CORS
Cors__AllowedOrigins__0="http://localhost:3000"
Cors__AllowedOrigins__1="http://localhost:5173"

# Logging
Serilog__MinimumLevel__Default="Information"
```

### **Development vs Production**
- **Development**: Uses LocalDB, detailed logging, Swagger UI enabled
- **Production**: Uses SQL Server, minimal logging, security headers enabled

## 🧪 **Testing Strategy**

### **Unit Tests** (Planned)
```bash
# Run unit tests
dotnet test EduCMS.Tests/EduCMS.Tests.csproj

# With coverage
dotnet test --collect:"XPlat Code Coverage"
```

### **Integration Tests** (Planned)
- **TestContainers** for database testing
- **WebApplicationFactory** for API testing
- **Health check validation**

## 🚀 **Deployment Options**

### **1. Docker Deployment**
```bash
# Build image
docker build -t educsms-api .

# Run container
docker run -p 8080:8080 \
  -e ConnectionStrings__DefaultConnection="..." \
  -e Jwt__Key="..." \
  educsms-api
```

### **2. Azure App Service**
```bash
# Deploy using Azure CLI
az webapp up --name educsms-api --resource-group educsms-rg --runtime "DOTNET:8.0"
```

### **3. Kubernetes** (Planned)
- Helm charts for deployment
- ConfigMaps and Secrets management
- Horizontal Pod Autoscaling

## 🔍 **Monitoring & Observability**

### **Health Checks**
- **Database connectivity** validation
- **External dependencies** monitoring
- **Custom business logic** health checks

### **Logging**
- **Structured logging** with Serilog
- **Request/Response** logging
- **Performance metrics** tracking
- **Error tracking** with context

### **Metrics** (Planned)
- **Application Insights** integration
- **Custom metrics** for business KPIs
- **Performance counters**

## 🔐 **Security Features**

### **Authentication & Authorization**
- **JWT Bearer** token validation
- **Role-based** access control (planned)
- **API key** authentication (planned)

### **Data Protection**
- **Input validation** on all endpoints
- **SQL injection** prevention via EF Core
- **XSS protection** with proper encoding
- **CORS** configuration for frontend integration

### **Security Headers**
- **HSTS** (HTTP Strict Transport Security)
- **X-Content-Type-Options**: nosniff
- **X-Frame-Options**: DENY
- **X-XSS-Protection**: 1; mode=block

## 📈 **Performance Optimizations**

### **Database**
- **Connection pooling** with retry policies
- **Async/await** throughout the application
- **Proper indexing** on frequently queried columns
- **Soft delete** with query filters

### **Caching** (Planned)
- **In-memory caching** for frequently accessed data
- **Redis** for distributed caching
- **Response caching** for static data

### **API Performance**
- **Pagination** for large datasets
- **Compression** for response payloads
- **Minimal API** endpoints for high-performance scenarios

## 🔄 **Frontend Integration**

### **Switching Between Backends**
Set environment variable in your React app:
```bash
# Use .NET API
VITE_USE_DOTNET_API=true
VITE_DOTNET_API_URL=http://localhost:5000/api/v1

# Use Supabase (default)
VITE_USE_DOTNET_API=false
```

### **API Compatibility**
The .NET API is designed to be compatible with the existing Supabase implementation:
- **Same data models** and response formats
- **Consistent error handling**
- **Compatible authentication** flow

## 🔧 **Troubleshooting**

### **Common Build Issues**

#### **Network Connectivity Problems**
If you encounter "connection aborted by host software" errors:

1. **Check Internet Connection**
   ```bash
   ping api.nuget.org
   ```

2. **Clear NuGet Cache**
   ```bash
   dotnet nuget locals all --clear
   ```

3. **Disable Antivirus/Firewall Temporarily**
   - Some antivirus software blocks NuGet downloads
   - Add exceptions for `dotnet.exe` and NuGet cache folders

4. **Use Corporate Proxy (if applicable)**
   Update `NuGet.Config` with proxy settings

#### **Package Version Issues**
If specific package versions are not found:

1. **Check Package Availability**
   ```bash
   dotnet list package --outdated
   ```

2. **Update to Latest Stable Versions**
   ```bash
   dotnet add package PackageName --version LatestVersion
   ```

3. **Remove Package Lock Files**
   ```bash
   rm -rf */obj */bin packages
   ```

#### **Build Failures**
If the build fails after package restore:

1. **Check .NET SDK Version**
   ```bash
   dotnet --version  # Should be 8.0.x or later
   ```

2. **Clean and Rebuild**
   ```bash
   dotnet clean EduCMS.sln
   dotnet build EduCMS.sln --configuration Release
   ```

## 🎯 **Interview Demonstration Points**

This backend showcases:

### **Technical Expertise**
- **Clean Architecture** implementation
- **SOLID principles** in practice
- **Enterprise patterns** (Repository, Unit of Work, Dependency Injection)
- **Modern C#** and .NET features

### **Best Practices**
- **Comprehensive error handling**
- **Structured logging** and monitoring
- **Security-first** approach
- **Performance optimization**

### **DevOps & Deployment**
- **Docker containerization**
- **Health checks** and monitoring
- **Configuration management**
- **CI/CD ready** structure

### **Scalability Considerations**
- **Async programming** throughout
- **Caching strategies**
- **Database optimization**
- **Microservices-ready** architecture

## 📚 **Additional Resources**

- **API Documentation**: Available at `/` when running locally
- **Architecture Decisions**: See `docs/architecture-decisions.md`
- **Deployment Guide**: See `docs/deployment-guide.md`
- **Contributing**: See `CONTRIBUTING.md`

---

**This .NET backend transforms EduCMS into a comprehensive full-stack demonstration suitable for senior developer interviews, showcasing both modern frontend and enterprise backend development expertise.**
