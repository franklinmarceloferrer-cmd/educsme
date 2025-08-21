# Enterprise Azure App Service Deployment Guide
## Senior Developer Interview Technical Demonstration

### 🎯 **Overview & Interview Context**

This guide demonstrates enterprise-level cloud deployment expertise using Azure App Service for a .NET application. Designed for senior developer interviews, it showcases modern DevOps practices, security implementations, and scalable architecture decisions.

**Key Demonstration Points:**
- Enterprise-grade infrastructure provisioning
- Security-first deployment approach
- CI/CD pipeline implementation
- Monitoring and observability
- Cost optimization strategies

---

## 📋 **Technical Specifications**

### **Target Framework: .NET 8 LTS**
**Interview Talking Point:** *"I chose .NET 8 LTS for this deployment because it provides long-term support until November 2026, ensuring stability for enterprise applications. The performance improvements in .NET 8, particularly in JSON serialization and minimal APIs, make it ideal for cloud-native applications."*

### **Technology Stack:**
- **.NET 8 LTS** - Latest LTS with enhanced performance
- **Entity Framework Core 8** - Modern ORM with advanced features
- **Azure SQL Database** - Managed database service
- **Application Insights** - Comprehensive monitoring
- **Azure Key Vault** - Secure configuration management

### **Architecture Decision Matrix:**
| Service | Chosen Solution | Alternative | Justification |
|---------|----------------|-------------|---------------|
| Compute | Azure App Service | Container Instances | Better for traditional web apps, built-in scaling |
| Database | Azure SQL Database | Cosmos DB | ACID compliance, familiar SQL patterns |
| Monitoring | Application Insights | Third-party APM | Native Azure integration, cost-effective |

---

## 🏗️ **Azure Infrastructure Setup**

### **Phase 1: Resource Group Creation**

**Interview Talking Point:** *"I follow enterprise naming conventions that include environment, region, and purpose for better resource management and cost tracking."*

```bash
# Azure CLI Commands
az group create \
  --name "rg-myapp-prod-eastus2" \
  --location "eastus2" \
  --tags Environment=Production Application=MyApp CostCenter=Engineering
```

**Naming Convention Strategy:**
- `rg-{application}-{environment}-{region}`
- Consistent across all resources
- Enables automated cost allocation

### **Phase 2: Azure SQL Database Setup**

**Interview Talking Point:** *"I'm using Azure SQL Database Standard S1 tier for this demo, which provides 20 DTUs and is cost-effective for development. In production, I'd recommend Premium P2 or higher for better performance and advanced features like In-Memory OLTP."*

```bash
# Create SQL Server
az sql server create \
  --name "sql-myapp-prod-eastus2" \
  --resource-group "rg-myapp-prod-eastus2" \
  --location "eastus2" \
  --admin-user "sqladmin" \
  --admin-password "SecurePassword123!" \
  --enable-ad-only-auth false

# Create SQL Database
az sql db create \
  --resource-group "rg-myapp-prod-eastus2" \
  --server "sql-myapp-prod-eastus2" \
  --name "sqldb-myapp-prod" \
  --service-objective S1 \
  --backup-storage-redundancy Local
```

**Security Configuration:**
```bash
# Configure firewall for Azure services
az sql server firewall-rule create \
  --resource-group "rg-myapp-prod-eastus2" \
  --server "sql-myapp-prod-eastus2" \
  --name "AllowAzureServices" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Add your IP for management access
az sql server firewall-rule create \
  --resource-group "rg-myapp-prod-eastus2" \
  --server "sql-myapp-prod-eastus2" \
  --name "AllowMyIP" \
  --start-ip-address "YOUR_IP_ADDRESS" \
  --end-ip-address "YOUR_IP_ADDRESS"
```

### **Phase 3: App Service Plan & App Service**

**Interview Talking Point:** *"I'm selecting Standard S1 for this demonstration because it provides staging slots for blue-green deployments and auto-scaling capabilities. The 1.75GB RAM and 100 total ACU are sufficient for most web applications."*

```bash
# Create App Service Plan
az appservice plan create \
  --name "asp-myapp-prod-eastus2" \
  --resource-group "rg-myapp-prod-eastus2" \
  --location "eastus2" \
  --sku S1 \
  --is-linux false

# Create App Service
az webapp create \
  --resource-group "rg-myapp-prod-eastus2" \
  --plan "asp-myapp-prod-eastus2" \
  --name "app-myapp-prod-eastus2" \
  --runtime "DOTNET|8.0"
```

### **Phase 4: Application Insights Integration**

```bash
# Create Application Insights
az monitor app-insights component create \
  --app "appi-myapp-prod-eastus2" \
  --location "eastus2" \
  --resource-group "rg-myapp-prod-eastus2" \
  --application-type web

# Link to App Service
az webapp config appsettings set \
  --resource-group "rg-myapp-prod-eastus2" \
  --name "app-myapp-prod-eastus2" \
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=YOUR_KEY"
```

---

## 🔐 **Security Implementation**

### **Managed Identity Setup**

**Interview Talking Point:** *"Using Managed Identity eliminates the need to store database credentials in configuration files, following the principle of least privilege and zero-trust security."*

```bash
# Enable System-Assigned Managed Identity
az webapp identity assign \
  --resource-group "rg-myapp-prod-eastus2" \
  --name "app-myapp-prod-eastus2"

# Grant SQL Database access to Managed Identity
az sql server ad-admin create \
  --resource-group "rg-myapp-prod-eastus2" \
  --server-name "sql-myapp-prod-eastus2" \
  --display-name "app-myapp-prod-eastus2" \
  --object-id "MANAGED_IDENTITY_OBJECT_ID"
```

### **Azure Key Vault Integration**

```bash
# Create Key Vault
az keyvault create \
  --name "kv-myapp-prod-eastus2" \
  --resource-group "rg-myapp-prod-eastus2" \
  --location "eastus2" \
  --sku standard

# Grant App Service access to Key Vault
az keyvault set-policy \
  --name "kv-myapp-prod-eastus2" \
  --object-id "MANAGED_IDENTITY_OBJECT_ID" \
  --secret-permissions get list
```

---

## 🚀 **Application Configuration**

### **.NET Application Setup**

**Program.cs Configuration:**
```csharp
using Microsoft.EntityFrameworkCore;
using Azure.Identity;
using Microsoft.Extensions.Configuration.AzureKeyVault;

var builder = WebApplication.CreateBuilder(args);

// Configuration Management
if (builder.Environment.IsProduction())
{
    var keyVaultEndpoint = builder.Configuration["KeyVaultEndpoint"];
    builder.Configuration.AddAzureKeyVault(
        new Uri(keyVaultEndpoint!),
        new DefaultAzureCredential());
}

// Database Configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlServer(connectionString);
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>()
    .AddSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")!);

// Application Insights
builder.Services.AddApplicationInsightsTelemetry();

var app = builder.Build();

// Health Check Endpoint
app.MapHealthChecks("/health");

app.Run();
```

### **Configuration Files**

**appsettings.json:**
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:sql-myapp-prod-eastus2.database.windows.net,1433;Database=sqldb-myapp-prod;Authentication=Active Directory Default;Encrypt=True;"
  },
  "KeyVaultEndpoint": "https://kv-myapp-prod-eastus2.vault.azure.net/"
}
```

**appsettings.Production.json:**
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft.AspNetCore": "Error"
    }
  }
}
```

---

## 📦 **Deployment Implementation**

### **Manual Deployment via Visual Studio**

**Interview Talking Point:** *"While I prefer automated deployments, understanding manual deployment is crucial for troubleshooting and emergency deployments."*

**Publish Profile Configuration:**
```xml
<Project>
  <PropertyGroup>
    <WebPublishMethod>MSDeploy</WebPublishMethod>
    <PublishUrl>app-myapp-prod-eastus2.scm.azurewebsites.net:443</PublishUrl>
    <SiteUrlToLaunchAfterPublish>https://app-myapp-prod-eastus2.azurewebsites.net</SiteUrlToLaunchAfterPublish>
    <LaunchSiteAfterPublish>True</LaunchSiteAfterPublish>
    <MSDeployServiceURL>app-myapp-prod-eastus2.scm.azurewebsites.net:443</MSDeployServiceURL>
    <DeployDefaultTarget>WebPublish</DeployDefaultTarget>
    <RemoteSitePhysicalPath />
    <SkipExtraFilesOnServer>False</SkipExtraFilesOnServer>
    <MSDeployPublishMethod>WMSVC</MSDeployPublishMethod>
    <EnableMSDeployBackup>True</EnableMSDeployBackup>
    <UserName>$app-myapp-prod-eastus2</UserName>
    <SavePWD>False</SavePWD>
  </PropertyGroup>
</Project>
```

### **Azure CLI Deployment**

```bash
# Build and publish application
dotnet publish -c Release -o ./publish

# Create deployment package
cd publish
zip -r ../deployment.zip .
cd ..

# Deploy to Azure
az webapp deployment source config-zip \
  --resource-group "rg-myapp-prod-eastus2" \
  --name "app-myapp-prod-eastus2" \
  --src deployment.zip
```

### **Connection String Configuration**

```bash
# Set connection string in App Service
az webapp config connection-string set \
  --resource-group "rg-myapp-prod-eastus2" \
  --name "app-myapp-prod-eastus2" \
  --connection-string-type SQLAzure \
  --settings DefaultConnection="Server=tcp:sql-myapp-prod-eastus2.database.windows.net,1433;Database=sqldb-myapp-prod;Authentication=Active Directory Default;Encrypt=True;"
```

---

## 🔍 **Verification & Troubleshooting**

### **Deployment Verification Checklist**

**Interview Talking Point:** *"I always follow a systematic verification process to ensure deployments are successful and the application is healthy."*

1. **Application Startup Verification:**
```bash
# Check application logs
az webapp log tail --resource-group "rg-myapp-prod-eastus2" --name "app-myapp-prod-eastus2"
```

2. **Health Endpoint Testing:**
```bash
# Test health endpoint
curl https://app-myapp-prod-eastus2.azurewebsites.net/health
```

3. **Database Connectivity:**
```bash
# Test database connection through application
curl https://app-myapp-prod-eastus2.azurewebsites.net/api/health/database
```

### **Common Issues & Solutions**

| Issue | Symptoms | Solution |
|-------|----------|----------|
| Database Connection Failed | 500 errors, timeout exceptions | Check firewall rules, verify connection string |
| Application Won't Start | Site unavailable, startup errors | Review application logs, check .NET version |
| Slow Performance | High response times | Enable Application Insights, check resource utilization |

---

## 🔄 **CI/CD Pipeline Implementation**

### **Option A: GitHub Actions**

**Interview Talking Point:** *"GitHub Actions provides excellent integration with Azure and supports matrix builds for testing across multiple environments. The workflow-as-code approach ensures version control of deployment processes."*

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Azure App Service

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  AZURE_WEBAPP_NAME: app-myapp-prod-eastus2
  AZURE_WEBAPP_PACKAGE_PATH: '.'
  DOTNET_VERSION: '8.0.x'

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4

    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ env.DOTNET_VERSION }}

    - name: Restore dependencies
      run: dotnet restore

    - name: Build
      run: dotnet build --no-restore --configuration Release

    - name: Test
      run: dotnet test --no-build --configuration Release --verbosity normal

    - name: Publish
      run: dotnet publish -c Release -o ${{env.DOTNET_ROOT}}/myapp

    - name: Upload artifact
      uses: actions/upload-artifact@v4
      with:
        name: .net-app
        path: ${{env.DOTNET_ROOT}}/myapp

  deploy-to-staging:
    runs-on: ubuntu-latest
    needs: build-and-test
    if: github.ref == 'refs/heads/develop'
    environment: staging

    steps:
    - name: Download artifact
      uses: actions/download-artifact@v4
      with:
        name: .net-app

    - name: Deploy to Azure Web App (Staging)
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        slot-name: staging
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE_STAGING }}
        package: .

  deploy-to-production:
    runs-on: ubuntu-latest
    needs: build-and-test
    if: github.ref == 'refs/heads/main'
    environment: production

    steps:
    - name: Download artifact
      uses: actions/download-artifact@v4
      with:
        name: .net-app

    - name: Deploy to Azure Web App (Production)
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .

    - name: Run Health Check
      run: |
        sleep 30
        curl -f https://${{ env.AZURE_WEBAPP_NAME }}.azurewebsites.net/health || exit 1
```

### **Option B: Azure DevOps**

**Interview Talking Point:** *"Azure DevOps provides superior integration with Azure services and enterprise features like variable groups and service connections. The YAML pipelines offer the same infrastructure-as-code benefits as GitHub Actions."*

**azure-pipelines.yml:**
```yaml
trigger:
  branches:
    include:
    - main
    - develop

variables:
  buildConfiguration: 'Release'
  dotNetFramework: 'net8.0'
  dotNetVersion: '8.0.x'
  azureSubscription: 'Azure-Service-Connection'
  webAppName: 'app-myapp-prod-eastus2'

stages:
- stage: Build
  displayName: 'Build and Test'
  jobs:
  - job: Build
    displayName: 'Build job'
    pool:
      vmImage: 'ubuntu-latest'

    steps:
    - task: UseDotNet@2
      displayName: 'Use .NET SDK'
      inputs:
        version: $(dotNetVersion)
        includePreviewVersions: false

    - task: DotNetCoreCLI@2
      displayName: 'Restore packages'
      inputs:
        command: 'restore'
        projects: '**/*.csproj'

    - task: DotNetCoreCLI@2
      displayName: 'Build application'
      inputs:
        command: 'build'
        projects: '**/*.csproj'
        arguments: '--configuration $(buildConfiguration) --no-restore'

    - task: DotNetCoreCLI@2
      displayName: 'Run tests'
      inputs:
        command: 'test'
        projects: '**/*Tests.csproj'
        arguments: '--configuration $(buildConfiguration) --no-build --collect:"XPlat Code Coverage"'

    - task: PublishCodeCoverageResults@1
      displayName: 'Publish code coverage'
      inputs:
        codeCoverageTool: 'Cobertura'
        summaryFileLocation: '$(Agent.TempDirectory)/**/coverage.cobertura.xml'

    - task: DotNetCoreCLI@2
      displayName: 'Publish application'
      inputs:
        command: 'publish'
        publishWebProjects: true
        arguments: '--configuration $(buildConfiguration) --output $(Build.ArtifactStagingDirectory)'
        zipAfterPublish: true

    - task: PublishBuildArtifacts@1
      displayName: 'Publish artifacts'
      inputs:
        PathtoPublish: '$(Build.ArtifactStagingDirectory)'
        ArtifactName: 'drop'

- stage: DeployStaging
  displayName: 'Deploy to Staging'
  dependsOn: Build
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
  jobs:
  - deployment: DeployStaging
    displayName: 'Deploy to Staging'
    environment: 'staging'
    pool:
      vmImage: 'ubuntu-latest'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            displayName: 'Deploy to Azure Web App Staging'
            inputs:
              azureSubscription: $(azureSubscription)
              appType: 'webApp'
              appName: $(webAppName)
              slotName: 'staging'
              package: '$(Pipeline.Workspace)/drop/*.zip'

- stage: DeployProduction
  displayName: 'Deploy to Production'
  dependsOn: Build
  condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/main'))
  jobs:
  - deployment: DeployProduction
    displayName: 'Deploy to Production'
    environment: 'production'
    pool:
      vmImage: 'ubuntu-latest'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureWebApp@1
            displayName: 'Deploy to Azure Web App'
            inputs:
              azureSubscription: $(azureSubscription)
              appType: 'webApp'
              appName: $(webAppName)
              package: '$(Pipeline.Workspace)/drop/*.zip'

          - task: PowerShell@2
            displayName: 'Health Check'
            inputs:
              targetType: 'inline'
              script: |
                Start-Sleep -Seconds 30
                $response = Invoke-WebRequest -Uri "https://$(webAppName).azurewebsites.net/health" -UseBasicParsing
                if ($response.StatusCode -ne 200) {
                  throw "Health check failed with status code: $($response.StatusCode)"
                }
                Write-Host "Health check passed successfully"
```

---

## 🏢 **Enterprise Features**

### **Auto-Scaling Configuration**

**Interview Talking Point:** *"Auto-scaling ensures optimal performance during traffic spikes while controlling costs during low-usage periods. I configure both scale-out and scale-up rules based on CPU and memory metrics."*

```bash
# Create auto-scale settings
az monitor autoscale create \
  --resource-group "rg-myapp-prod-eastus2" \
  --resource "asp-myapp-prod-eastus2" \
  --resource-type "Microsoft.Web/serverfarms" \
  --name "autoscale-myapp-prod" \
  --min-count 2 \
  --max-count 10 \
  --count 2

# Scale-out rule (CPU > 70%)
az monitor autoscale rule create \
  --resource-group "rg-myapp-prod-eastus2" \
  --autoscale-name "autoscale-myapp-prod" \
  --condition "Percentage CPU > 70 avg 5m" \
  --scale out 1

# Scale-in rule (CPU < 30%)
az monitor autoscale rule create \
  --resource-group "rg-myapp-prod-eastus2" \
  --autoscale-name "autoscale-myapp-prod" \
  --condition "Percentage CPU < 30 avg 10m" \
  --scale in 1
```

### **Deployment Slots (Blue-Green Deployment)**

```bash
# Create staging slot
az webapp deployment slot create \
  --resource-group "rg-myapp-prod-eastus2" \
  --name "app-myapp-prod-eastus2" \
  --slot "staging"

# Deploy to staging slot
az webapp deployment source config-zip \
  --resource-group "rg-myapp-prod-eastus2" \
  --name "app-myapp-prod-eastus2" \
  --slot "staging" \
  --src deployment.zip

# Swap slots after validation
az webapp deployment slot swap \
  --resource-group "rg-myapp-prod-eastus2" \
  --name "app-myapp-prod-eastus2" \
  --slot "staging" \
  --target-slot "production"
```

### **Application Insights Custom Telemetry**

**Custom Telemetry Implementation:**
```csharp
public class TelemetryService
{
    private readonly TelemetryClient _telemetryClient;

    public TelemetryService(TelemetryClient telemetryClient)
    {
        _telemetryClient = telemetryClient;
    }

    public void TrackBusinessEvent(string eventName, Dictionary<string, string> properties = null)
    {
        _telemetryClient.TrackEvent(eventName, properties);
    }

    public void TrackPerformanceMetric(string metricName, double value)
    {
        _telemetryClient.TrackMetric(metricName, value);
    }

    public void TrackDependency(string dependencyName, string commandName,
        DateTimeOffset startTime, TimeSpan duration, bool success)
    {
        _telemetryClient.TrackDependency(dependencyName, commandName,
            startTime, duration, success);
    }
}
```

---

## 🏗️ **Infrastructure as Code**

### **Azure Bicep Template**

**Interview Talking Point:** *"Bicep provides a more readable and maintainable approach to ARM templates. It compiles to ARM JSON but offers better IntelliSense and validation during development."*

**main.bicep:**
```bicep
@description('The name of the application')
param applicationName string = 'myapp'

@description('The environment (dev, staging, prod)')
param environment string = 'prod'

@description('The Azure region for deployment')
param location string = resourceGroup().location

@description('The SKU for the App Service Plan')
param appServicePlanSku string = 'S1'

@description('The administrator login for SQL Server')
param sqlAdministratorLogin string

@secure()
@description('The administrator password for SQL Server')
param sqlAdministratorPassword string

// Variables
var resourcePrefix = '${applicationName}-${environment}'
var appServicePlanName = 'asp-${resourcePrefix}-${location}'
var appServiceName = 'app-${resourcePrefix}-${location}'
var sqlServerName = 'sql-${resourcePrefix}-${location}'
var sqlDatabaseName = 'sqldb-${resourcePrefix}'
var applicationInsightsName = 'appi-${resourcePrefix}-${location}'
var keyVaultName = 'kv-${resourcePrefix}-${location}'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: appServicePlanSku
    capacity: 1
  }
  properties: {
    reserved: false
  }
  tags: {
    Environment: environment
    Application: applicationName
  }
}

// App Service
resource appService 'Microsoft.Web/sites@2022-03-01' = {
  name: appServiceName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      netFrameworkVersion: 'v8.0'
      metadata: [
        {
          name: 'CURRENT_STACK'
          value: 'dotnet'
        }
      ]
    }
    httpsOnly: true
  }
  tags: {
    Environment: environment
    Application: applicationName
  }
}

// SQL Server
resource sqlServer 'Microsoft.Sql/servers@2022-05-01-preview' = {
  name: sqlServerName
  location: location
  properties: {
    administratorLogin: sqlAdministratorLogin
    administratorLoginPassword: sqlAdministratorPassword
    version: '12.0'
  }
  tags: {
    Environment: environment
    Application: applicationName
  }
}

// SQL Database
resource sqlDatabase 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  sku: {
    name: 'S1'
    tier: 'Standard'
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
  }
  tags: {
    Environment: environment
    Application: applicationName
  }
}

// SQL Server Firewall Rule for Azure Services
resource sqlFirewallRule 'Microsoft.Sql/servers/firewallRules@2022-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: applicationInsightsName
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    Request_Source: 'rest'
  }
  tags: {
    Environment: environment
    Application: applicationName
  }
}

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2022-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    accessPolicies: [
      {
        tenantId: subscription().tenantId
        objectId: appService.identity.principalId
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
    ]
    enabledForDeployment: false
    enabledForDiskEncryption: false
    enabledForTemplateDeployment: false
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
  }
  tags: {
    Environment: environment
    Application: applicationName
  }
}

// App Service Configuration
resource appServiceConfig 'Microsoft.Web/sites/config@2022-03-01' = {
  parent: appService
  name: 'appsettings'
  properties: {
    APPLICATIONINSIGHTS_CONNECTION_STRING: applicationInsights.properties.ConnectionString
    KeyVaultEndpoint: keyVault.properties.vaultUri
    ASPNETCORE_ENVIRONMENT: environment
  }
}

// Outputs
output appServiceName string = appService.name
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output sqlServerName string = sqlServer.name
output applicationInsightsName string = applicationInsights.name
output keyVaultName string = keyVault.name
```

### **Deployment Script**

**deploy.ps1:**
```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,

    [Parameter(Mandatory=$true)]
    [string]$Location,

    [Parameter(Mandatory=$true)]
    [string]$ApplicationName,

    [Parameter(Mandatory=$true)]
    [string]$Environment,

    [Parameter(Mandatory=$true)]
    [string]$SqlAdministratorLogin,

    [Parameter(Mandatory=$true)]
    [SecureString]$SqlAdministratorPassword
)

# Create resource group if it doesn't exist
$resourceGroup = Get-AzResourceGroup -Name $ResourceGroupName -ErrorAction SilentlyContinue
if (-not $resourceGroup) {
    Write-Host "Creating resource group: $ResourceGroupName"
    New-AzResourceGroup -Name $ResourceGroupName -Location $Location
}

# Deploy Bicep template
Write-Host "Deploying infrastructure..."
$deployment = New-AzResourceGroupDeployment `
    -ResourceGroupName $ResourceGroupName `
    -TemplateFile "main.bicep" `
    -applicationName $ApplicationName `
    -environment $Environment `
    -location $Location `
    -sqlAdministratorLogin $SqlAdministratorLogin `
    -sqlAdministratorPassword $SqlAdministratorPassword `
    -Verbose

if ($deployment.ProvisioningState -eq "Succeeded") {
    Write-Host "Infrastructure deployment completed successfully!" -ForegroundColor Green
    Write-Host "App Service URL: $($deployment.Outputs.appServiceUrl.Value)" -ForegroundColor Yellow
} else {
    Write-Error "Infrastructure deployment failed!"
    exit 1
}
```

---

## 📊 **Monitoring & Observability**

### **Application Insights Queries**

**Interview Talking Point:** *"Effective monitoring requires both proactive alerting and reactive investigation capabilities. These KQL queries help identify performance bottlenecks and user experience issues."*

**Performance Monitoring:**
```kusto
// Average response time by operation
requests
| where timestamp > ago(1h)
| summarize avg(duration), count() by operation_Name
| order by avg_duration desc

// Failed requests analysis
requests
| where timestamp > ago(24h) and success == false
| summarize count() by resultCode, operation_Name
| order by count_ desc

// Dependency failures
dependencies
| where timestamp > ago(1h) and success == false
| summarize count() by type, target, resultCode
| order by count_ desc
```

### **Custom Alerts**

```bash
# High error rate alert
az monitor metrics alert create \
  --name "High Error Rate" \
  --resource-group "rg-myapp-prod-eastus2" \
  --scopes "/subscriptions/SUBSCRIPTION_ID/resourceGroups/rg-myapp-prod-eastus2/providers/Microsoft.Web/sites/app-myapp-prod-eastus2" \
  --condition "count requests/failed > 10" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 2

# High CPU utilization alert
az monitor metrics alert create \
  --name "High CPU Usage" \
  --resource-group "rg-myapp-prod-eastus2" \
  --scopes "/subscriptions/SUBSCRIPTION_ID/resourceGroups/rg-myapp-prod-eastus2/providers/Microsoft.Web/serverfarms/asp-myapp-prod-eastus2" \
  --condition "avg Percentage CPU > 80" \
  --window-size 5m \
  --evaluation-frequency 1m \
  --severity 3
```

---

## 💰 **Cost Optimization Strategies**

### **Interview Talking Points:**

**Resource Right-Sizing:**
*"I regularly review Azure Advisor recommendations and use Azure Cost Management to identify underutilized resources. For this application, I'd monitor the App Service Plan utilization and consider scaling down during off-peak hours."*

**Reserved Instances:**
*"For production workloads with predictable usage patterns, Azure Reserved Instances can provide up to 72% cost savings. I'd recommend 1-year reserved instances for the App Service Plan and SQL Database."*

**Development Environment Optimization:**
```bash
# Auto-shutdown for development environments
az webapp config appsettings set \
  --resource-group "rg-myapp-dev-eastus2" \
  --name "app-myapp-dev-eastus2" \
  --settings WEBSITE_TIME_ZONE="Eastern Standard Time"

# Use Azure Dev/Test pricing for non-production
az sql db update \
  --resource-group "rg-myapp-dev-eastus2" \
  --server "sql-myapp-dev-eastus2" \
  --name "sqldb-myapp-dev" \
  --service-objective Basic
```

---

## 🚨 **Disaster Recovery & Backup**

### **Backup Strategy**

**Interview Talking Point:** *"A comprehensive backup strategy includes both application-level backups and database backups with different retention policies based on business requirements."*

```bash
# Configure App Service backup
az webapp config backup create \
  --resource-group "rg-myapp-prod-eastus2" \
  --webapp-name "app-myapp-prod-eastus2" \
  --container-url "https://mystorageaccount.blob.core.windows.net/backups" \
  --frequency 1440 \
  --retain-one true \
  --retention 30

# Configure SQL Database automated backup
az sql db ltr-policy set \
  --resource-group "rg-myapp-prod-eastus2" \
  --server "sql-myapp-prod-eastus2" \
  --database "sqldb-myapp-prod" \
  --weekly-retention "P4W" \
  --monthly-retention "P12M" \
  --yearly-retention "P7Y" \
  --week-of-year 1
```

---

## ✅ **Complete Deployment Checklist**

### **Pre-Deployment**
- [ ] Resource naming conventions defined
- [ ] Security requirements documented
- [ ] Performance benchmarks established
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and alerting configured

### **Deployment**
- [ ] Infrastructure provisioned via IaC
- [ ] Application deployed and verified
- [ ] Database migrations applied
- [ ] Health checks passing
- [ ] SSL certificates configured

### **Post-Deployment**
- [ ] Performance monitoring active
- [ ] Security scanning completed
- [ ] Load testing performed
- [ ] Documentation updated
- [ ] Team training completed

---

## 🎤 **Interview Demonstration Strategy**

### **Key Technical Talking Points**

**Architecture Decisions:**
- "I chose Azure App Service over Container Instances because it provides built-in scaling, deployment slots, and integrated monitoring without the complexity of container orchestration."

**Security Implementation:**
- "Using Managed Identity eliminates credential management overhead and follows Azure's recommended security practices for service-to-service authentication."

**Scalability Approach:**
- "The auto-scaling configuration ensures we maintain performance during traffic spikes while optimizing costs during low-usage periods."

**Monitoring Strategy:**
- "Application Insights provides end-to-end observability from user interactions to database queries, enabling proactive issue resolution."

### **Cost Optimization Discussion**
- "I've implemented a tiered approach: Basic tier for development, Standard for staging with deployment slots, and Premium for production with advanced features."

### **DevOps Best Practices**
- "The CI/CD pipeline includes automated testing, security scanning, and blue-green deployments to minimize downtime and ensure quality."

---

## 📁 **Sample Application Structure**

```
MyApp/
├── src/
│   ├── MyApp.Web/
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── Views/
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── appsettings.Production.json
│   └── MyApp.Data/
│       ├── ApplicationDbContext.cs
│       └── Migrations/
├── tests/
│   ├── MyApp.Tests/
│   └── MyApp.IntegrationTests/
├── infrastructure/
│   ├── main.bicep
│   ├── parameters.json
│   └── deploy.ps1
├── .github/workflows/
│   └── deploy.yml
├── azure-pipelines.yml
└── README.md
```

This comprehensive guide demonstrates enterprise-level Azure deployment expertise suitable for senior developer interviews, covering infrastructure provisioning, security implementation, CI/CD pipelines, monitoring, and cost optimization strategies.
