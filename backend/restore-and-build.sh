#!/bin/bash

# EduCMS Backend - Clean Restore and Build Script
# This script performs a clean restore and build of the EduCMS backend solution

echo "🚀 EduCMS Backend - Clean Restore and Build"
echo "=========================================="

# Set error handling
set -e

# Get the script directory (backend folder)
BACKEND_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$BACKEND_PATH"

echo "📁 Working directory: $BACKEND_PATH"

# Check if .NET 8.0 SDK is installed
echo "🔍 Checking .NET SDK version..."
DOTNET_VERSION=$(dotnet --version)
echo "✅ .NET SDK version: $DOTNET_VERSION"

if [[ ! $DOTNET_VERSION == 8.* ]]; then
    echo "⚠️  .NET 8.0 SDK is recommended for this project"
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
if [ -d "packages" ]; then
    rm -rf "packages"
    echo "   Removed packages folder"
fi

# Clean each project
PROJECTS=("EduCMS.Api" "EduCMS.Core" "EduCMS.Infrastructure")
for project in "${PROJECTS[@]}"; do
    if [ -d "$project/bin" ]; then
        rm -rf "$project/bin"
        echo "   Cleaned $project/bin"
    fi
    if [ -d "$project/obj" ]; then
        rm -rf "$project/obj"
        echo "   Cleaned $project/obj"
    fi
done

# Clear NuGet cache
echo "🗑️  Clearing NuGet cache..."
dotnet nuget locals all --clear
echo "✅ NuGet cache cleared"

# Restore packages
echo "📦 Restoring NuGet packages..."
dotnet restore EduCMS.sln --verbosity minimal --no-cache
echo "✅ Package restore completed"

# Build solution
echo "🔨 Building solution..."
dotnet build EduCMS.sln --configuration Release --no-restore --verbosity minimal
echo "✅ Build completed successfully"

# Run tests (if any exist)
echo "🧪 Checking for tests..."
TEST_PROJECTS=$(find . -name "*.Tests.csproj" | wc -l)
if [ $TEST_PROJECTS -gt 0 ]; then
    echo "🧪 Running tests..."
    dotnet test EduCMS.sln --configuration Release --no-build --verbosity minimal
    echo "✅ Tests completed"
else
    echo "ℹ️  No test projects found"
fi

echo ""
echo "🎉 Build completed successfully!"
echo "   You can now run the API with: dotnet run --project EduCMS.Api"
