using System.ComponentModel.DataAnnotations;

namespace MyApp.Models;

/// <summary>
/// Weather forecast model for demonstration purposes
/// Interview Talking Point: "I use record types for immutable data models
/// which provides value equality and better performance for read-heavy scenarios"
/// </summary>
public class WeatherForecast
{
    public int Id { get; set; }
    public DateOnly Date { get; set; }
    public int TemperatureC { get; set; }
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
    public string? Summary { get; set; }
}

/// <summary>
/// User entity with soft delete support
/// Interview Talking Point: "Soft deletes are implemented for audit compliance
/// and data recovery scenarios common in enterprise applications"
/// </summary>
public class User
{
    public int Id { get; set; }
    
    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
    
    public string FullName => $"{FirstName} {LastName}";
}

/// <summary>
/// Audit log entity for tracking data changes
/// Interview Talking Point: "Comprehensive audit logging is essential for
/// compliance and debugging in enterprise applications"
/// </summary>
public class AuditLog
{
    public int Id { get; set; }
    
    [Required]
    [StringLength(100)]
    public string EntityName { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string Action { get; set; } = string.Empty;
    
    [Required]
    [StringLength(50)]
    public string EntityId { get; set; } = string.Empty;
    
    public string? Changes { get; set; }
    
    [StringLength(50)]
    public string? UserId { get; set; }
    
    public DateTime Timestamp { get; set; }
}

/// <summary>
/// Health check response model
/// Interview Talking Point: "Structured health check responses provide
/// detailed information for monitoring and troubleshooting"
/// </summary>
public record HealthCheckResponse(
    string Status,
    IEnumerable<HealthCheckItem> Checks,
    string Duration
);

public record HealthCheckItem(
    string Name,
    string Status,
    string? Exception,
    string Duration
);

/// <summary>
/// API response wrapper for consistent error handling
/// Interview Talking Point: "Consistent API response structure improves
/// client integration and error handling"
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public IEnumerable<string>? Errors { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    public static ApiResponse<T> SuccessResult(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message
        };
    }

    public static ApiResponse<T> ErrorResult(string message, IEnumerable<string>? errors = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Errors = errors
        };
    }
}

/// <summary>
/// Configuration model for application settings
/// Interview Talking Point: "Strongly-typed configuration prevents runtime errors
/// and provides IntelliSense support during development"
/// </summary>
public class ApplicationSettings
{
    public const string SectionName = "ApplicationSettings";
    
    public string ApplicationName { get; set; } = "MyApp";
    public string Version { get; set; } = "1.0.0";
    public bool EnableDetailedErrors { get; set; }
    public int DefaultPageSize { get; set; } = 20;
    public int MaxPageSize { get; set; } = 100;
    
    public CacheSettings Cache { get; set; } = new();
    public LoggingSettings Logging { get; set; } = new();
}

public class CacheSettings
{
    public int DefaultExpirationMinutes { get; set; } = 30;
    public bool EnableDistributedCache { get; set; }
    public string? RedisConnectionString { get; set; }
}

public class LoggingSettings
{
    public string LogLevel { get; set; } = "Information";
    public bool EnableStructuredLogging { get; set; } = true;
    public bool EnableFileLogging { get; set; }
    public string? LogFilePath { get; set; }
}
