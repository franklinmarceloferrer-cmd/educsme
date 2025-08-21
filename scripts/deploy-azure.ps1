# EduCMS Azure Deployment Script
# This script creates Azure resources and deploys the EduCMS application

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName = "educsme-prod-rg",
    
    [Parameter(Mandatory=$true)]
    [string]$AppName = "educsme-demo",
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus2",
    
    [Parameter(Mandatory=$false)]
    [string]$PlanName = "educsme-plan",
    
    [Parameter(Mandatory=$false)]
    [string]$Sku = "B1"
)

Write-Host "🚀 Starting EduCMS Azure Deployment" -ForegroundColor Green
Write-Host "Resource Group: $ResourceGroupName" -ForegroundColor Yellow
Write-Host "App Name: $AppName" -ForegroundColor Yellow
Write-Host "Location: $Location" -ForegroundColor Yellow

# Check if Azure CLI is installed
try {
    az --version | Out-Null
    Write-Host "✅ Azure CLI is installed" -ForegroundColor Green
} catch {
    Write-Error "❌ Azure CLI is not installed. Please install it first."
    exit 1
}

# Check if user is logged in
try {
    $account = az account show --query "user.name" -o tsv
    Write-Host "✅ Logged in as: $account" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Not logged in to Azure. Please run 'az login'" -ForegroundColor Yellow
    az login
}

# Create Resource Group
Write-Host "📦 Creating Resource Group..." -ForegroundColor Blue
az group create --name $ResourceGroupName --location $Location --tags Environment=Production Application=EduCMS

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Failed to create resource group"
    exit 1
}

# Create App Service Plan
Write-Host "🏗️ Creating App Service Plan..." -ForegroundColor Blue
az appservice plan create `
    --name $PlanName `
    --resource-group $ResourceGroupName `
    --location $Location `
    --sku $Sku `
    --is-linux

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Failed to create App Service Plan"
    exit 1
}

# Create Web App
Write-Host "🌐 Creating Web App..." -ForegroundColor Blue
az webapp create `
    --resource-group $ResourceGroupName `
    --plan $PlanName `
    --name $AppName `
    --runtime "NODE:18-lts"

if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Failed to create Web App"
    exit 1
}

# Configure App Settings
Write-Host "⚙️ Configuring App Settings..." -ForegroundColor Blue
az webapp config appsettings set `
    --resource-group $ResourceGroupName `
    --name $AppName `
    --settings WEBSITE_NODE_DEFAULT_VERSION="18-lts" `
               SCM_DO_BUILD_DURING_DEPLOYMENT="false" `
               WEBSITE_RUN_FROM_PACKAGE="1"

# Enable HTTPS Only
Write-Host "🔒 Enabling HTTPS Only..." -ForegroundColor Blue
az webapp update --resource-group $ResourceGroupName --name $AppName --https-only true

# Get the app URL
$appUrl = az webapp show --resource-group $ResourceGroupName --name $AppName --query "defaultHostName" -o tsv

Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "🌐 App URL: https://$appUrl" -ForegroundColor Cyan
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Set up GitHub Secrets for CI/CD:" -ForegroundColor White
Write-Host "      - AZURE_WEBAPP_PUBLISH_PROFILE" -ForegroundColor Gray
Write-Host "      - VITE_SUPABASE_URL" -ForegroundColor Gray
Write-Host "      - VITE_SUPABASE_ANON_KEY" -ForegroundColor Gray
Write-Host "   2. Push to main branch to trigger deployment" -ForegroundColor White
Write-Host "   3. Configure custom domain (optional)" -ForegroundColor White

# Get publish profile for GitHub Actions
Write-Host "📄 Getting Publish Profile for GitHub Actions..." -ForegroundColor Blue
$publishProfile = az webapp deployment list-publishing-profiles --resource-group $ResourceGroupName --name $AppName --xml

Write-Host "📋 Copy this publish profile to GitHub Secrets as AZURE_WEBAPP_PUBLISH_PROFILE:" -ForegroundColor Yellow
Write-Host $publishProfile -ForegroundColor Gray
