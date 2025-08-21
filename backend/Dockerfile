# Use the official .NET 8 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY ["EduCMS.sln", "./"]
COPY ["NuGet.Config", "./"]
COPY ["EduCMS.Api/EduCMS.Api.csproj", "EduCMS.Api/"]
COPY ["EduCMS.Core/EduCMS.Core.csproj", "EduCMS.Core/"]
COPY ["EduCMS.Infrastructure/EduCMS.Infrastructure.csproj", "EduCMS.Infrastructure/"]

# Restore dependencies using solution file
RUN dotnet restore "EduCMS.sln" --verbosity minimal

# Copy all source code
COPY . .

# Build the application
WORKDIR "/src/EduCMS.Api"
RUN dotnet build "EduCMS.Api.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "EduCMS.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Use the official .NET 8 runtime image for the final stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Create a non-root user for security
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Copy the published application
COPY --from=publish /app/publish .

# Create logs directory
RUN mkdir -p /app/logs

# Expose port 8080 (default for ASP.NET Core in containers)
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start the application
ENTRYPOINT ["dotnet", "EduCMS.Api.dll"]
