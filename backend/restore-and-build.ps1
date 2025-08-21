# EduCMS Backend - Clean Restore and Build Script
# This script performs a clean restore and build of the EduCMS backend solution

Write-Host "🚀 EduCMS Backend - Clean Restore and Build" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Set error action preference
$ErrorActionPreference = "Stop"

try {
    # Get the script directory (backend folder)
    $BackendPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    Set-Location $BackendPath
    
    Write-Host "📁 Working directory: $BackendPath" -ForegroundColor Yellow
    
    # Check if .NET 8.0 SDK is installed
    Write-Host "🔍 Checking .NET SDK version..." -ForegroundColor Yellow
    $dotnetVersion = dotnet --version
    Write-Host "✅ .NET SDK version: $dotnetVersion" -ForegroundColor Green
    
    if (-not $dotnetVersion.StartsWith("8.")) {
        Write-Warning "⚠️  .NET 8.0 SDK is recommended for this project"
    }
    
    # Clean previous builds
    Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
    if (Test-Path "packages") {
        Remove-Item -Recurse -Force "packages"
        Write-Host "   Removed packages folder" -ForegroundColor Gray
    }
    
    # Clean each project
    $projects = @("EduCMS.Api", "EduCMS.Core", "EduCMS.Infrastructure")
    foreach ($project in $projects) {
        if (Test-Path "$project/bin") {
            Remove-Item -Recurse -Force "$project/bin"
            Write-Host "   Cleaned $project/bin" -ForegroundColor Gray
        }
        if (Test-Path "$project/obj") {
            Remove-Item -Recurse -Force "$project/obj"
            Write-Host "   Cleaned $project/obj" -ForegroundColor Gray
        }
    }
    
    # Clear NuGet cache
    Write-Host "🗑️  Clearing NuGet cache..." -ForegroundColor Yellow
    dotnet nuget locals all --clear
    Write-Host "✅ NuGet cache cleared" -ForegroundColor Green
    
    # Restore packages
    Write-Host "📦 Restoring NuGet packages..." -ForegroundColor Yellow
    dotnet restore EduCMS.sln --verbosity minimal --no-cache
    Write-Host "✅ Package restore completed" -ForegroundColor Green
    
    # Build solution
    Write-Host "🔨 Building solution..." -ForegroundColor Yellow
    dotnet build EduCMS.sln --configuration Release --no-restore --verbosity minimal
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
    
    # Run tests (if any exist)
    Write-Host "🧪 Checking for tests..." -ForegroundColor Yellow
    $testProjects = Get-ChildItem -Recurse -Filter "*.Tests.csproj"
    if ($testProjects.Count -gt 0) {
        Write-Host "🧪 Running tests..." -ForegroundColor Yellow
        dotnet test EduCMS.sln --configuration Release --no-build --verbosity minimal
        Write-Host "✅ Tests completed" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No test projects found" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "🎉 Build completed successfully!" -ForegroundColor Green
    Write-Host "   You can now run the API with: dotnet run --project EduCMS.Api" -ForegroundColor Gray
    
} catch {
    Write-Host ""
    Write-Host "❌ Build failed with error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "   1. Ensure you have .NET 8.0 SDK installed" -ForegroundColor Gray
    Write-Host "   2. Check your internet connection for NuGet package downloads" -ForegroundColor Gray
    Write-Host "   3. Try running: dotnet nuget locals all --clear" -ForegroundColor Gray
    Write-Host "   4. Check if any antivirus software is blocking NuGet" -ForegroundColor Gray
    exit 1
}
