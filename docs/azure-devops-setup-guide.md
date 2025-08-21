# Azure DevOps Setup Guide for EduCMS
## Service Connections, Variable Groups, and Pipeline Configuration

### 🎯 Overview

This guide provides step-by-step instructions to configure Azure DevOps for the EduCMS project, including service connections, variable groups, environments, and pipeline setup.

---

## 📋 Prerequisites

- Azure DevOps organization and project
- Azure subscription with appropriate permissions
- Azure Web Apps created for frontend and backend
- GitHub repository access (for syncing)

---

## 🔗 Service Connections

### 1. Azure Resource Manager Service Connection

**Purpose**: Allows Azure DevOps to deploy to Azure resources

**Setup Steps**:
1. Navigate to **Project Settings** → **Service connections**
2. Click **New service connection** → **Azure Resource Manager**
3. Choose **Service principal (automatic)**
4. Configure:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: `educsme-prod-rg` (or your resource group)
   - **Service connection name**: `Azure-EduCMS-ServiceConnection`
   - **Description**: "Service connection for EduCMS deployments"
5. Click **Save**

**Required Permissions**:
- Contributor role on the resource group
- Web App deployment permissions

---

## 📊 Variable Groups

### 1. EduCMS-Secrets (Frontend)

**Purpose**: Stores sensitive configuration for frontend builds

**Variables**:
```
VITE_SUPABASE_URL: https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY: your-supabase-anon-key
```

**Setup**:
1. Go to **Pipelines** → **Library** → **Variable groups**
2. Click **+ Variable group**
3. Name: `EduCMS-Secrets`
4. Add variables above
5. Mark sensitive variables as **Secret** (lock icon)
6. **Save**

### 2. EduCMS-Production (Frontend)

**Purpose**: Production-specific frontend configuration

**Variables**:
```
VITE_USE_DOTNET_API: false
VITE_APP_ENVIRONMENT: production
azureWebAppName: educsme-demo
```

### 3. EduCMS-Staging (Frontend)

**Purpose**: Staging-specific frontend configuration

**Variables**:
```
VITE_USE_DOTNET_API: false
VITE_APP_ENVIRONMENT: staging
azureWebAppName: educsme-demo
```

### 4. EduCMS-Backend-Secrets

**Purpose**: Stores sensitive backend configuration

**Variables**:
```
JwtKey: your-jwt-secret-key-at-least-32-characters-long
JwtIssuer: EduCMS.Api
JwtAudience: EduCMS.Client
```

### 5. EduCMS-Backend-Production

**Purpose**: Production backend configuration

**Variables**:
```
ProductionConnectionString: Server=your-server;Database=EduCMSDb;...
ProductionCorsOrigins: https://educsme.azurewebsites.net
azureWebAppName: educsme-api
```

### 6. EduCMS-Backend-Staging

**Purpose**: Staging backend configuration

**Variables**:
```
StagingConnectionString: Server=your-staging-server;Database=EduCMSDb_Staging;...
StagingCorsOrigins: https://educsme-demo-staging.azurewebsites.net
azureWebAppName: educsme-api
```

---

## 🌍 Environments

### Setup Environments for Deployment Approvals

**1. EduCMS-Production**
- Go to **Pipelines** → **Environments**
- Click **New environment**
- Name: `EduCMS-Production`
- Resource: None (for now)
- Add **Approvals and checks** if needed

**2. EduCMS-Staging**
- Name: `EduCMS-Staging`
- Resource: None

**3. EduCMS-Backend-Production**
- Name: `EduCMS-Backend-Production`

**4. EduCMS-Backend-Staging**
- Name: `EduCMS-Backend-Staging`

---

## 🚀 Pipeline Setup

### 1. Frontend Pipeline

**File**: `azure-pipelines.yml` (root directory)

**Setup Steps**:
1. Go to **Pipelines** → **Pipelines**
2. Click **New pipeline**
3. Choose **Azure Repos Git** or **GitHub** (depending on your setup)
4. Select your repository
5. Choose **Existing Azure Pipelines YAML file**
6. Select `/azure-pipelines.yml`
7. **Save and run**

### 2. Backend Pipeline

**File**: `azure-pipelines-backend.yml` (root directory)

**Setup Steps**:
1. Create new pipeline
2. Select `/azure-pipelines-backend.yml`
3. **Save and run**

---

## 🔄 Repository Synchronization

### Option 1: Manual Sync Commands

```bash
# Clone from GitHub
git clone https://github.com/franklinmarceloferrer-cmd/educsme.git
cd educsme

# Add Azure DevOps remote
git remote add azure https://franklinmarceloferrer@dev.azure.com/franklinmarceloferrer/educsme/_git/educsme

# Push to Azure DevOps
git push azure main
git push azure develop

# Push all branches and tags
git push azure --all
git push azure --tags
```

### Option 2: Automated Mirror Setup

**GitHub Actions Workflow** (`.github/workflows/mirror-to-azure-devops.yml`):
```yaml
name: Mirror to Azure DevOps

on:
  push:
    branches: [ main, develop ]

jobs:
  mirror:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 0
    
    - name: Mirror to Azure DevOps
      run: |
        git remote add azure https://franklinmarceloferrer:${{ secrets.AZURE_DEVOPS_PAT }}@dev.azure.com/franklinmarceloferrer/educsme/_git/educsme
        git push azure --all
        git push azure --tags
```

---

## 🔐 Security Configuration

### Personal Access Tokens (PAT)

**For Azure DevOps**:
1. Go to **User Settings** → **Personal access tokens**
2. Click **New Token**
3. Name: `EduCMS-Pipeline-Access`
4. Scopes: 
   - Build (read & execute)
   - Release (read, write & execute)
   - Variable Groups (read & manage)
5. **Create**

### GitHub Secrets (if using mirror)

Add to GitHub repository secrets:
- `AZURE_DEVOPS_PAT`: Your Azure DevOps PAT

---

## 📋 Deployment Checklist

### Before First Deployment

- [ ] Service connection created and tested
- [ ] All variable groups configured
- [ ] Environments set up with appropriate approvals
- [ ] Azure Web Apps created (frontend and backend)
- [ ] Database connection strings configured
- [ ] CORS origins properly set

### Frontend Deployment Verification

- [ ] Build artifacts generated successfully
- [ ] Staging deployment works
- [ ] Production deployment works
- [ ] Health checks pass
- [ ] Environment variables loaded correctly

### Backend Deployment Verification

- [ ] .NET build successful
- [ ] Unit tests pass
- [ ] API health endpoint responds
- [ ] Swagger documentation accessible
- [ ] Database connectivity verified
- [ ] JWT authentication configured

---

## 🔧 Troubleshooting

### Common Issues

**1. Service Connection Authentication Failed**
- Verify Azure subscription permissions
- Check service principal has Contributor role
- Ensure resource group exists

**2. Variable Group Not Found**
- Verify variable group name matches pipeline YAML
- Check variable group permissions
- Ensure variables are not empty

**3. Deployment Fails**
- Check Azure Web App configuration
- Verify app settings and connection strings
- Review deployment logs in Azure portal

**4. Health Check Fails**
- Ensure health endpoint is implemented
- Check application startup logs
- Verify all dependencies are available

---

## 📞 Support Resources

- **Azure DevOps Documentation**: https://docs.microsoft.com/en-us/azure/devops/
- **Azure App Service**: https://docs.microsoft.com/en-us/azure/app-service/
- **Pipeline YAML Reference**: https://docs.microsoft.com/en-us/azure/devops/pipelines/yaml-schema/
