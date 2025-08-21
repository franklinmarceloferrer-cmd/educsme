using Microsoft.EntityFrameworkCore;
using Azure.Identity;
using Microsoft.Extensions.Configuration.AzureKeyVault;
using MyApp.Data;
using MyApp.Services;

var builder = WebApplication.CreateBuilder(args);

// Configuration Management - Interview Talking Point:
// "I'm using a layered configuration approach: appsettings.json for defaults,
// environment-specific files for overrides, and Azure Key Vault for secrets in production"
if (builder.Environment.IsProduction())
{
    var keyVaultEndpoint = builder.Configuration["KeyVaultEndpoint"];
    if (!string.IsNullOrEmpty(keyVaultEndpoint))
    {
        builder.Configuration.AddAzureKeyVault(
            new Uri(keyVaultEndpoint),
            new DefaultAzureCredential());
    }
}

// Database Configuration - Interview Talking Point:
// "Using Entity Framework Core with SQL Server provides strong typing,
// migration support, and excellent performance with compiled queries"
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    });
});

// Health Checks - Interview Talking Point:
// "Health checks provide both liveness and readiness probes for Azure App Service
// and enable automated monitoring and alerting"
builder.Services.AddHealthChecks()
    .AddDbContextCheck<ApplicationDbContext>("database")
    .AddSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")!,
        name: "sql-server",
        timeout: TimeSpan.FromSeconds(30))
    .AddCheck<CustomHealthCheck>("custom-health-check");

// Application Insights - Interview Talking Point:
// "Application Insights provides comprehensive telemetry including request tracking,
// dependency monitoring, and custom business metrics"
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.EnableAdaptiveSampling = true;
    options.EnableQuickPulseMetricStream = true;
});

// Services Registration
builder.Services.AddMemoryCache();
builder.Services.AddScoped<ITelemetryService, TelemetryService>();
builder.Services.AddScoped<IWeatherService, WeatherService>();

// API Controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS Configuration - Interview Talking Point:
// "CORS is configured to allow specific origins in production while being
// more permissive in development for easier testing"
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultPolicy", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            policy.WithOrigins("https://yourdomain.com")
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Security Headers - Interview Talking Point:
// "Security headers protect against common web vulnerabilities and are
// essential for enterprise applications"
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Referrer-Policy", "strict-origin-when-cross-origin");
    
    if (!app.Environment.IsDevelopment())
    {
        context.Response.Headers.Add("Strict-Transport-Security", 
            "max-age=31536000; includeSubDomains");
    }
    
    await next();
});

app.UseHttpsRedirection();
app.UseCors("DefaultPolicy");
app.UseAuthorization();

// Health Check Endpoints - Interview Talking Point:
// "Multiple health check endpoints provide different levels of detail
// for monitoring systems and troubleshooting"
app.MapHealthChecks("/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(x => new
            {
                name = x.Key,
                status = x.Value.Status.ToString(),
                exception = x.Value.Exception?.Message,
                duration = x.Value.Duration.ToString()
            }),
            duration = report.TotalDuration.ToString()
        };
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
    }
});

app.MapHealthChecks("/health/ready", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.MapHealthChecks("/health/live", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
{
    Predicate = _ => false
});

app.MapControllers();

// Database Migration - Interview Talking Point:
// "Automatic migrations in production should be carefully considered.
// In enterprise environments, I prefer explicit migration deployment"
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await context.Database.MigrateAsync();
}

app.Run();

// Make the implicit Program class public for testing
public partial class Program { }
