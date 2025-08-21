# 🚀 EduCMS Azure Deployment - Quick Start Guide

## ✅ Current Status
- ✅ **Code**: All changes committed and pushed to GitHub
- ✅ **Database**: Supabase foreign key relationships fixed
- ✅ **UI**: Brand colors implemented (Red Ribbon + Matisse)
- ✅ **CI/CD**: GitHub Actions workflow configured
- ✅ **Scripts**: Azure deployment scripts ready

---

## 🎯 **Option 1: GitHub Actions (Recommended)**

### **Step 1: Execute Azure Infrastructure Setup**
```powershell
# Run the enhanced deployment script
.\scripts\deploy-azure.ps1 -ResourceGroupName "educsme-prod-rg" -AppName "educsme-demo" -Location "eastus2"
```

### **Step 2: Configure GitHub Secrets**
1. Go to: https://github.com/franklinmarceloferrer-cmd/educsme/settings/secrets/actions
2. Add these secrets:
   - `AZURE_WEBAPP_PUBLISH_PROFILE` (from script output)
   - `AZURE_WEBAPP_PUBLISH_PROFILE_STAGING` (from script output)
   - `VITE_SUPABASE_URL` = `https://rttarliasydfffldayui.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `[Get from Supabase Dashboard]`

### **Step 3: Trigger Deployment**
```bash
# For staging deployment
git checkout develop
git push origin develop

# For production deployment  
git checkout main
git push origin main
```

### **Step 4: Verify Deployment**
- **Production**: https://educsme-demo.azurewebsites.net
- **Staging**: https://educsme-demo-staging.azurewebsites.net

---

## 🎯 **Option 2: Azure DevOps**

### **Step 1: Create Azure DevOps Pipeline**
1. Go to: https://dev.azure.com/[your-org]/educsme
2. Create new pipeline from GitHub repository
3. Use existing `azure-pipelines.yml` (if available) or create new

### **Step 2: Configure Service Connection**
1. Create Azure Resource Manager service connection
2. Grant permissions to the resource group
3. Configure variable groups for environment variables

### **Step 3: Run Pipeline**
- Trigger pipeline from Azure DevOps dashboard
- Monitor deployment progress
- Verify successful deployment

---

## 🔐 **Security Configuration**

### **Required Environment Variables:**
```
VITE_SUPABASE_URL=https://rttarliasydfffldayui.supabase.co
VITE_SUPABASE_ANON_KEY=[SECURE_KEY_FROM_SUPABASE]
VITE_USE_DOTNET_API=false
VITE_APP_ENVIRONMENT=production
```

### **Supabase Anonymous Key Location:**
1. Go to: https://supabase.com/dashboard/project/rttarliasydfffldayui
2. Navigate to: Settings → API
3. Copy the "anon public" key (safe for frontend use)

---

## 🧪 **Verification Checklist**

### **Infrastructure Verification:**
- [ ] Azure App Service is running
- [ ] Staging slot is created
- [ ] Environment variables are configured
- [ ] HTTPS is enabled

### **Application Verification:**
- [ ] Homepage loads successfully
- [ ] Login functionality works
- [ ] Supabase database connection established
- [ ] Documents page loads (foreign key fix verified)
- [ ] Brand colors are applied correctly
- [ ] File upload/download functionality works

### **Performance Verification:**
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Mobile responsiveness works
- [ ] All routes are accessible

---

## 🚨 **Troubleshooting**

### **Common Issues:**

**1. Build Fails:**
```bash
# Check Node.js version
node --version  # Should be 20.x

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**2. Environment Variables Not Working:**
```bash
# Verify in Azure App Service
az webapp config appsettings list --resource-group "educsme-prod-rg" --name "educsme-demo"
```

**3. Supabase Connection Issues:**
- Verify VITE_SUPABASE_URL is correct
- Check VITE_SUPABASE_ANON_KEY is valid
- Ensure RLS policies allow access

**4. GitHub Actions Fails:**
- Check GitHub Secrets are configured
- Verify publish profiles are valid
- Review workflow logs for specific errors

---

## 📊 **Monitoring & Maintenance**

### **Health Check URLs:**
- **Production**: https://educsme-demo.azurewebsites.net
- **Staging**: https://educsme-demo-staging.azurewebsites.net

### **Azure Portal Monitoring:**
1. Go to: https://portal.azure.com
2. Navigate to: Resource Groups → educsme-prod-rg → educsme-demo
3. Monitor: Metrics, Logs, Application Insights

### **Cost Monitoring:**
- **Estimated Cost**: ~$15-20/month
- **App Service Plan**: B1 tier (~$13/month)
- **Storage & Bandwidth**: ~$2-7/month

---

## 🎯 **Next Steps After Deployment**

### **Immediate:**
1. **Test all functionality** thoroughly
2. **Configure custom domain** (if needed)
3. **Set up monitoring alerts**
4. **Document any issues** encountered

### **Future Enhancements:**
1. **Application Insights** for detailed monitoring
2. **Azure CDN** for global performance
3. **Custom domain** with SSL certificate
4. **Automated backup** strategy
5. **Load testing** for performance validation

---

## 📞 **Support & Resources**

### **Documentation:**
- **Detailed Guide**: `docs/azure-deployment-strategy.md`
- **Architecture Guide**: `docs/architecture.md`
- **Troubleshooting**: `docs/troubleshooting-guide.md`

### **Key URLs:**
- **GitHub Repository**: https://github.com/franklinmarceloferrer-cmd/educsme
- **Supabase Dashboard**: https://supabase.com/dashboard/project/rttarliasydfffldayui
- **Azure Portal**: https://portal.azure.com

---

## ✅ **Deployment Success Criteria**

**🎉 Deployment is successful when:**
- ✅ Application loads without errors
- ✅ User authentication works
- ✅ Database operations function correctly
- ✅ File upload/download works
- ✅ All pages are accessible
- ✅ Brand styling is applied
- ✅ Mobile responsiveness works
- ✅ Performance meets requirements

**Ready to deploy! Choose your preferred deployment method and follow the steps above.**
