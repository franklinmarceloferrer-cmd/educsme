# EduCMS Azure DevOps Implementation Checklist

## 🎯 Phase 1: Repository Synchronization (Today)

### Step 1: Initial Repository Sync
```bash
# Navigate to your local repository
cd C:\Users\frank_o3qkvjc\Documents\GitHub\educsme

# Add Azure DevOps remote
git remote add azure https://franklinmarceloferrer@dev.azure.com/franklinmarceloferrer/educsme/_git/educsme

# Push all content to Azure DevOps
git push azure main
git push azure develop
git push azure --tags
```

### Step 2: Create Azure DevOps Personal Access Token
1. Go to Azure DevOps → User Settings → Personal Access Tokens
2. Create new token with these scopes:
   - **Code**: Read & Write
   - **Build**: Read & Execute  
   - **Release**: Read, Write & Execute
   - **Variable Groups**: Read & Manage
3. Copy the token (you'll need it for GitHub secrets)

### Step 3: Configure GitHub Secrets
Add to GitHub repository secrets (Settings → Secrets and variables → Actions):
- `AZURE_DEVOPS_PAT`: Your Azure DevOps Personal Access Token

---

## 🔧 Phase 2: Azure DevOps Configuration (This Week)

### Service Connections
- [ ] Create Azure Resource Manager service connection
- [ ] Name: `Azure-EduCMS-ServiceConnection`
- [ ] Scope: Your Azure subscription and resource group

### Variable Groups
Create these variable groups in Azure DevOps (Pipelines → Library):

#### EduCMS-Secrets
- [ ] `VITE_SUPABASE_URL`: Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key (mark as secret)

#### EduCMS-Production  
- [ ] `VITE_USE_DOTNET_API`: false
- [ ] `VITE_APP_ENVIRONMENT`: production
- [ ] `azureWebAppName`: educsme-demo

#### EduCMS-Staging
- [ ] `VITE_USE_DOTNET_API`: false  
- [ ] `VITE_APP_ENVIRONMENT`: staging
- [ ] `azureWebAppName`: educsme-demo

#### EduCMS-Backend-Secrets (for future backend deployment)
- [ ] `JwtKey`: Your JWT secret key (32+ characters, mark as secret)
- [ ] `JwtIssuer`: EduCMS.Api
- [ ] `JwtAudience`: EduCMS.Client

### Environments
Create these environments (Pipelines → Environments):
- [ ] `EduCMS-Production` (with approval gates if desired)
- [ ] `EduCMS-Staging`
- [ ] `EduCMS-Backend-Production`
- [ ] `EduCMS-Backend-Staging`

---

## 🚀 Phase 3: Pipeline Setup (This Week)

### Frontend Pipeline
1. Go to Pipelines → Pipelines → New Pipeline
2. Choose your Azure DevOps repository
3. Select "Existing Azure Pipelines YAML file"
4. Choose `/azure-pipelines.yml`
5. Save and run

### Backend Pipeline (Optional - for future use)
1. Create another new pipeline
2. Select `/azure-pipelines-backend.yml`
3. Save (don't run until backend is ready for deployment)

---

## ✅ Phase 4: Testing and Verification

### Test Repository Sync
- [ ] Make a small change in GitHub
- [ ] Push to `develop` branch
- [ ] Verify automatic sync to Azure DevOps
- [ ] Check that Azure DevOps pipeline triggers

### Test Deployments
- [ ] Verify staging deployment works
- [ ] Test production deployment (from main branch)
- [ ] Confirm health checks pass
- [ ] Validate environment variables are loaded

---

## 🔍 Troubleshooting Guide

### Common Issues and Solutions

**Mirror Workflow Fails**:
- Check Azure DevOps PAT hasn't expired
- Verify PAT has correct permissions
- Ensure Azure DevOps repository exists

**Pipeline Fails to Find Variable Group**:
- Verify variable group names match exactly
- Check variable group permissions
- Ensure all required variables are set

**Deployment Fails**:
- Verify service connection is working
- Check Azure Web App exists and is running
- Review deployment logs in Azure portal

**Health Check Fails**:
- Ensure your app responds at the root URL
- Check application startup logs
- Verify all environment variables are set

---

## 📊 Success Criteria

### Repository Sync
- [ ] All branches synchronized between GitHub and Azure DevOps
- [ ] Automatic mirroring working on push events
- [ ] No sync failures in the last 24 hours

### Pipeline Deployment
- [ ] Frontend pipeline builds successfully
- [ ] Staging deployment accessible
- [ ] Production deployment accessible  
- [ ] Health checks passing
- [ ] Build time under 10 minutes

### Monitoring
- [ ] Pipeline success rate > 95%
- [ ] Deployment notifications working
- [ ] Error alerts configured

---

## 🎯 Benefits Achieved

### Technical Benefits
✅ **Redundancy**: Multiple deployment pipelines ensure high availability
✅ **Enterprise Features**: Access to Azure DevOps advanced capabilities
✅ **Scalability**: Separate pipelines for frontend and backend
✅ **Security**: Proper secrets management and environment isolation

### Professional Benefits  
✅ **Skill Demonstration**: Proficiency with both GitHub Actions and Azure DevOps
✅ **Best Practices**: Enterprise-grade CI/CD implementation
✅ **Portfolio Enhancement**: Shows advanced DevOps capabilities
✅ **Interview Readiness**: Real-world dual-platform experience

---

## 📞 Support Resources

- **Azure DevOps Setup Guide**: `docs/azure-devops-setup-guide.md`
- **Repository Sync Strategy**: `docs/repository-sync-strategy.md`
- **GitHub Actions Workflow**: `.github/workflows/mirror-to-azure-devops.yml`
- **Frontend Pipeline**: `azure-pipelines.yml`
- **Backend Pipeline**: `azure-pipelines-backend.yml`

---

## 🚀 Ready to Deploy!

Your EduCMS project now has:
- ✅ Synchronized repositories (GitHub ↔ Azure DevOps)
- ✅ Dual CI/CD pipelines ready for deployment
- ✅ Enterprise-grade configuration
- ✅ Comprehensive documentation
- ✅ Automated monitoring and health checks

**Next Action**: Execute Phase 1 to sync your repositories and begin the Azure DevOps setup!
