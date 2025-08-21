# Azure App Service Deployment Troubleshooting Guide

## 🚨 **Common Deployment Issues & Solutions**

### **1. Application Won't Start**

#### **Symptoms:**
- HTTP 500.30 errors
- "Application failed to start" messages
- Site shows generic error page

#### **Diagnostic Steps:**
```bash
# Check application logs
az webapp log tail --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2"

# Download logs for detailed analysis
az webapp log download --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2"

# Check deployment logs
az webapp deployment list-publishing-credentials --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2"
```

#### **Common Causes & Solutions:**

**Missing .NET Runtime:**
```bash
# Verify runtime stack
az webapp config show --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2" --query "netFrameworkVersion"

# Update runtime if needed
az webapp config set --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2" --net-framework-version "v8.0"
```

**Configuration Issues:**
```bash
# Check application settings
az webapp config appsettings list --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2"

# Verify connection strings
az webapp config connection-string list --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2"
```

**Interview Talking Point:** *"I always start troubleshooting with the application logs and work systematically through the deployment pipeline to identify the root cause."*

---

### **2. Database Connection Failures**

#### **Symptoms:**
- SqlException: Cannot open server
- Timeout errors
- Authentication failures

#### **Diagnostic Steps:**
```bash
# Test database connectivity from App Service
az webapp ssh --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2"

# Inside the SSH session:
# sqlcmd -S sql-myapp-prod-eastus2.database.windows.net -d sqldb-myapp-prod -G
```

#### **Common Causes & Solutions:**

**Firewall Rules:**
```bash
# Check current firewall rules
az sql server firewall-rule list --resource-group "rg-myapp-prod-eastus2" --server "sql-myapp-prod-eastus2"

# Add App Service outbound IPs
az webapp show --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2" --query "outboundIpAddresses" --output tsv

# Add firewall rule for App Service IPs
az sql server firewall-rule create --resource-group "rg-myapp-prod-eastus2" --server "sql-myapp-prod-eastus2" --name "AppServiceIPs" --start-ip-address "IP_ADDRESS" --end-ip-address "IP_ADDRESS"
```

**Connection String Issues:**
```bash
# Verify connection string format for Managed Identity
az webapp config connection-string set --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2" --connection-string-type SQLAzure --settings DefaultConnection="Server=tcp:sql-myapp-prod-eastus2.database.windows.net,1433;Database=sqldb-myapp-prod;Authentication=Active Directory Default;Encrypt=True;"
```

**Managed Identity Configuration:**
```bash
# Verify Managed Identity is enabled
az webapp identity show --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2"

# Check SQL Server AD admin
az sql server ad-admin list --resource-group "rg-myapp-prod-eastus2" --server "sql-myapp-prod-eastus2"
```

---

### **3. Performance Issues**

#### **Symptoms:**
- Slow response times
- High CPU/memory usage
- Request timeouts

#### **Diagnostic Steps:**
```bash
# Check App Service metrics
az monitor metrics list --resource "/subscriptions/SUBSCRIPTION_ID/resourceGroups/rg-myapp-prod-eastus2/providers/Microsoft.Web/sites/app-myapp-prod-eastus2" --metric "CpuPercentage,MemoryPercentage,ResponseTime"

# Review Application Insights
# Navigate to Azure Portal > Application Insights > Performance
```

#### **Solutions:**

**Scale Up/Out:**
```bash
# Scale up to higher tier
az appservice plan update --resource-group "rg-myapp-prod-eastus2" --name "asp-myapp-prod-eastus2" --sku P1V2

# Scale out (add instances)
az appservice plan update --resource-group "rg-myapp-prod-eastus2" --name "asp-myapp-prod-eastus2" --number-of-workers 3
```

**Enable Application Insights Profiler:**
```bash
# Enable profiler for detailed performance analysis
az webapp config appsettings set --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2" --settings APPINSIGHTS_PROFILERFEATURE_VERSION="1.0.0"
```

---

### **4. SSL/TLS Certificate Issues**

#### **Symptoms:**
- Certificate warnings
- HTTPS redirects failing
- Mixed content errors

#### **Solutions:**

**Enable HTTPS Only:**
```bash
az webapp update --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2" --https-only true
```

**Custom Domain Certificate:**
```bash
# Add custom domain
az webapp config hostname add --resource-group "rg-myapp-prod-eastus2" --webapp-name "app-myapp-prod-eastus2" --hostname "www.yourdomain.com"

# Create managed certificate
az webapp config ssl create --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2" --hostname "www.yourdomain.com"
```

---

### **5. Deployment Slot Issues**

#### **Symptoms:**
- Slot swap failures
- Configuration not swapping correctly
- Different behavior between slots

#### **Solutions:**

**Verify Slot Configuration:**
```bash
# List deployment slots
az webapp deployment slot list --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2"

# Check slot-specific settings
az webapp config appsettings list --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2" --slot "staging"
```

**Configure Sticky Settings:**
```bash
# Mark settings as slot-specific (sticky)
az webapp config appsettings set --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2" --settings ENVIRONMENT="Production" --slot-settings ENVIRONMENT
```

---

## 🔧 **Advanced Troubleshooting Tools**

### **Kudu Console Access**
```bash
# Access Kudu console
https://app-myapp-prod-eastus2.scm.azurewebsites.net/
```

**Interview Talking Point:** *"Kudu provides direct access to the App Service file system and process information, which is invaluable for deep troubleshooting."*

### **Application Insights Queries**

**Failed Requests Analysis:**
```kusto
requests
| where timestamp > ago(1h)
| where success == false
| summarize count() by resultCode, operation_Name
| order by count_ desc
```

**Performance Bottlenecks:**
```kusto
requests
| where timestamp > ago(1h)
| summarize avg(duration), percentile(duration, 95) by operation_Name
| order by avg_duration desc
```

**Dependency Failures:**
```kusto
dependencies
| where timestamp > ago(1h)
| where success == false
| summarize count() by type, target, resultCode
| order by count_ desc
```

### **Health Check Monitoring**

**Custom Health Check Implementation:**
```csharp
public class DatabaseHealthCheck : IHealthCheck
{
    private readonly ApplicationDbContext _context;

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            await _context.Database.CanConnectAsync(cancellationToken);
            return HealthCheckResult.Healthy("Database connection successful");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Database connection failed", ex);
        }
    }
}
```

---

## 📊 **Monitoring & Alerting Setup**

### **Key Metrics to Monitor**

**Application Performance:**
- Response time (95th percentile)
- Request rate
- Error rate
- Dependency response time

**Infrastructure:**
- CPU percentage
- Memory percentage
- Disk usage
- Network I/O

### **Alert Configuration**

**High Error Rate Alert:**
```bash
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group "rg-myapp-prod-eastus2" \
  --scopes "/subscriptions/SUBSCRIPTION_ID/resourceGroups/rg-myapp-prod-eastus2/providers/Microsoft.Web/sites/app-myapp-prod-eastus2" \
  --condition "count requests/failed > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 2 \
  --description "Alert when error rate exceeds threshold"
```

**High Response Time Alert:**
```bash
az monitor metrics alert create \
  --name "High Response Time" \
  --resource-group "rg-myapp-prod-eastus2" \
  --scopes "/subscriptions/SUBSCRIPTION_ID/resourceGroups/rg-myapp-prod-eastus2/providers/Microsoft.Web/sites/app-myapp-prod-eastus2" \
  --condition "avg AverageResponseTime > 2000" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 3 \
  --description "Alert when average response time exceeds 2 seconds"
```

---

## 🎯 **Interview Troubleshooting Scenarios**

### **Scenario 1: Application Suddenly Stops Working**

**Interview Response Framework:**
1. **Immediate Assessment:** Check health endpoints and application logs
2. **Recent Changes:** Review recent deployments or configuration changes
3. **Infrastructure Status:** Verify Azure service health and resource availability
4. **Systematic Investigation:** Work through the stack from application to infrastructure
5. **Resolution & Prevention:** Implement fix and improve monitoring/alerting

### **Scenario 2: Intermittent Database Timeouts**

**Interview Response Framework:**
1. **Pattern Analysis:** Identify when timeouts occur (time of day, load patterns)
2. **Connection Pool Analysis:** Review connection string settings and pool configuration
3. **Database Performance:** Check SQL Database metrics and query performance
4. **Network Investigation:** Verify firewall rules and network connectivity
5. **Optimization:** Implement connection resilience and query optimization

### **Scenario 3: Memory Leaks in Production**

**Interview Response Framework:**
1. **Memory Profiling:** Use Application Insights and diagnostic tools
2. **Code Review:** Identify potential memory leak sources (event handlers, static references)
3. **Monitoring Setup:** Implement memory usage alerts and tracking
4. **Gradual Resolution:** Use deployment slots for safe testing of fixes
5. **Long-term Monitoring:** Establish baseline metrics and ongoing monitoring

---

## 📋 **Troubleshooting Checklist**

### **Pre-Deployment Verification**
- [ ] Application builds successfully locally
- [ ] All tests pass
- [ ] Configuration validated for target environment
- [ ] Database migrations tested
- [ ] Health checks implemented and tested

### **Post-Deployment Verification**
- [ ] Application starts successfully
- [ ] Health endpoints return healthy status
- [ ] Database connectivity confirmed
- [ ] Key functionality tested
- [ ] Performance metrics within acceptable range
- [ ] Logs show no critical errors

### **Ongoing Monitoring**
- [ ] Application Insights configured with custom telemetry
- [ ] Alerts configured for key metrics
- [ ] Log aggregation and analysis setup
- [ ] Regular performance reviews scheduled
- [ ] Incident response procedures documented

**Interview Talking Point:** *"Effective troubleshooting requires a systematic approach, comprehensive monitoring, and the ability to quickly isolate issues using the right diagnostic tools. The key is to establish good observability from the start rather than trying to add it after problems occur."*
