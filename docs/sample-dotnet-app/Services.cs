using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.EntityFrameworkCore;
using MyApp.Data;
using MyApp.Models;

namespace MyApp.Services;

/// <summary>
/// Telemetry service for Application Insights integration
/// Interview Talking Point: "Custom telemetry service provides a clean abstraction
/// over Application Insights and enables consistent tracking across the application"
/// </summary>
public interface ITelemetryService
{
    void TrackEvent(string eventName, Dictionary<string, string>? properties = null);
    void TrackMetric(string metricName, double value, Dictionary<string, string>? properties = null);
    void TrackDependency(string dependencyName, string commandName, DateTimeOffset startTime, TimeSpan duration, bool success);
    void TrackException(Exception exception, Dictionary<string, string>? properties = null);
    void TrackRequest(string name, DateTimeOffset startTime, TimeSpan duration, string responseCode, bool success);
}

public class TelemetryService : ITelemetryService
{
    private readonly TelemetryClient _telemetryClient;
    private readonly ILogger<TelemetryService> _logger;

    public TelemetryService(TelemetryClient telemetryClient, ILogger<TelemetryService> logger)
    {
        _telemetryClient = telemetryClient;
        _logger = logger;
    }

    public void TrackEvent(string eventName, Dictionary<string, string>? properties = null)
    {
        try
        {
            _telemetryClient.TrackEvent(eventName, properties);
            _logger.LogInformation("Tracked event: {EventName}", eventName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to track event: {EventName}", eventName);
        }
    }

    public void TrackMetric(string metricName, double value, Dictionary<string, string>? properties = null)
    {
        try
        {
            _telemetryClient.TrackMetric(metricName, value, properties);
            _logger.LogDebug("Tracked metric: {MetricName} = {Value}", metricName, value);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to track metric: {MetricName}", metricName);
        }
    }

    public void TrackDependency(string dependencyName, string commandName, DateTimeOffset startTime, TimeSpan duration, bool success)
    {
        try
        {
            _telemetryClient.TrackDependency(dependencyName, commandName, startTime, duration, success);
            _logger.LogDebug("Tracked dependency: {DependencyName}.{CommandName} - Success: {Success}, Duration: {Duration}ms", 
                dependencyName, commandName, success, duration.TotalMilliseconds);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to track dependency: {DependencyName}.{CommandName}", dependencyName, commandName);
        }
    }

    public void TrackException(Exception exception, Dictionary<string, string>? properties = null)
    {
        try
        {
            _telemetryClient.TrackException(exception, properties);
            _logger.LogError(exception, "Tracked exception: {ExceptionType}", exception.GetType().Name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to track exception: {OriginalException}", exception.Message);
        }
    }

    public void TrackRequest(string name, DateTimeOffset startTime, TimeSpan duration, string responseCode, bool success)
    {
        try
        {
            var requestTelemetry = new RequestTelemetry(name, startTime, duration, responseCode, success);
            _telemetryClient.TrackRequest(requestTelemetry);
            _logger.LogDebug("Tracked request: {RequestName} - {ResponseCode}, Duration: {Duration}ms", 
                name, responseCode, duration.TotalMilliseconds);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to track request: {RequestName}", name);
        }
    }
}

/// <summary>
/// Weather service with caching and telemetry
/// Interview Talking Point: "This service demonstrates proper separation of concerns,
/// caching strategies, and telemetry integration for monitoring business operations"
/// </summary>
public interface IWeatherService
{
    Task<IEnumerable<WeatherForecast>> GetForecastsAsync(int days = 5);
    Task<WeatherForecast?> GetForecastByIdAsync(int id);
    Task<WeatherForecast> CreateForecastAsync(WeatherForecast forecast);
    Task<bool> UpdateForecastAsync(int id, WeatherForecast forecast);
    Task<bool> DeleteForecastAsync(int id);
}

public class WeatherService : IWeatherService
{
    private readonly ApplicationDbContext _context;
    private readonly ITelemetryService _telemetryService;
    private readonly ILogger<WeatherService> _logger;
    private readonly IMemoryCache _cache;

    public WeatherService(
        ApplicationDbContext context,
        ITelemetryService telemetryService,
        ILogger<WeatherService> logger,
        IMemoryCache cache)
    {
        _context = context;
        _telemetryService = telemetryService;
        _logger = logger;
        _cache = cache;
    }

    public async Task<IEnumerable<WeatherForecast>> GetForecastsAsync(int days = 5)
    {
        var startTime = DateTimeOffset.UtcNow;
        var cacheKey = $"weather_forecasts_{days}";

        try
        {
            // Check cache first
            if (_cache.TryGetValue(cacheKey, out IEnumerable<WeatherForecast>? cachedForecasts))
            {
                _telemetryService.TrackEvent("WeatherForecast.CacheHit", new Dictionary<string, string>
                {
                    ["Days"] = days.ToString(),
                    ["Source"] = "Cache"
                });
                return cachedForecasts!;
            }

            // Fetch from database
            var forecasts = await _context.WeatherForecasts
                .Where(f => f.Date >= DateOnly.FromDateTime(DateTime.Now))
                .Take(days)
                .OrderBy(f => f.Date)
                .ToListAsync();

            // Cache the results
            _cache.Set(cacheKey, forecasts, TimeSpan.FromMinutes(15));

            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackDependency("Database", "GetWeatherForecasts", startTime, duration, true);
            _telemetryService.TrackMetric("WeatherForecast.Retrieved", forecasts.Count);

            _logger.LogInformation("Retrieved {Count} weather forecasts in {Duration}ms", 
                forecasts.Count, duration.TotalMilliseconds);

            return forecasts;
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackDependency("Database", "GetWeatherForecasts", startTime, duration, false);
            _telemetryService.TrackException(ex, new Dictionary<string, string>
            {
                ["Operation"] = "GetForecastsAsync",
                ["Days"] = days.ToString()
            });

            _logger.LogError(ex, "Failed to retrieve weather forecasts for {Days} days", days);
            throw;
        }
    }

    public async Task<WeatherForecast?> GetForecastByIdAsync(int id)
    {
        var startTime = DateTimeOffset.UtcNow;

        try
        {
            var forecast = await _context.WeatherForecasts.FindAsync(id);
            
            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackDependency("Database", "GetWeatherForecastById", startTime, duration, forecast != null);

            if (forecast == null)
            {
                _logger.LogWarning("Weather forecast with ID {Id} not found", id);
            }

            return forecast;
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackDependency("Database", "GetWeatherForecastById", startTime, duration, false);
            _telemetryService.TrackException(ex, new Dictionary<string, string>
            {
                ["Operation"] = "GetForecastByIdAsync",
                ["Id"] = id.ToString()
            });

            _logger.LogError(ex, "Failed to retrieve weather forecast with ID {Id}", id);
            throw;
        }
    }

    public async Task<WeatherForecast> CreateForecastAsync(WeatherForecast forecast)
    {
        var startTime = DateTimeOffset.UtcNow;

        try
        {
            _context.WeatherForecasts.Add(forecast);
            await _context.SaveChangesAsync();

            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackDependency("Database", "CreateWeatherForecast", startTime, duration, true);
            _telemetryService.TrackEvent("WeatherForecast.Created", new Dictionary<string, string>
            {
                ["Id"] = forecast.Id.ToString(),
                ["Date"] = forecast.Date.ToString()
            });

            // Invalidate cache
            _cache.Remove("weather_forecasts_5");

            _logger.LogInformation("Created weather forecast with ID {Id}", forecast.Id);
            return forecast;
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackDependency("Database", "CreateWeatherForecast", startTime, duration, false);
            _telemetryService.TrackException(ex, new Dictionary<string, string>
            {
                ["Operation"] = "CreateForecastAsync"
            });

            _logger.LogError(ex, "Failed to create weather forecast");
            throw;
        }
    }

    public async Task<bool> UpdateForecastAsync(int id, WeatherForecast forecast)
    {
        var startTime = DateTimeOffset.UtcNow;

        try
        {
            var existingForecast = await _context.WeatherForecasts.FindAsync(id);
            if (existingForecast == null)
            {
                return false;
            }

            existingForecast.Date = forecast.Date;
            existingForecast.TemperatureC = forecast.TemperatureC;
            existingForecast.Summary = forecast.Summary;

            await _context.SaveChangesAsync();

            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackDependency("Database", "UpdateWeatherForecast", startTime, duration, true);
            _telemetryService.TrackEvent("WeatherForecast.Updated", new Dictionary<string, string>
            {
                ["Id"] = id.ToString()
            });

            // Invalidate cache
            _cache.Remove("weather_forecasts_5");

            _logger.LogInformation("Updated weather forecast with ID {Id}", id);
            return true;
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackDependency("Database", "UpdateWeatherForecast", startTime, duration, false);
            _telemetryService.TrackException(ex, new Dictionary<string, string>
            {
                ["Operation"] = "UpdateForecastAsync",
                ["Id"] = id.ToString()
            });

            _logger.LogError(ex, "Failed to update weather forecast with ID {Id}", id);
            throw;
        }
    }

    public async Task<bool> DeleteForecastAsync(int id)
    {
        var startTime = DateTimeOffset.UtcNow;

        try
        {
            var forecast = await _context.WeatherForecasts.FindAsync(id);
            if (forecast == null)
            {
                return false;
            }

            _context.WeatherForecasts.Remove(forecast);
            await _context.SaveChangesAsync();

            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackDependency("Database", "DeleteWeatherForecast", startTime, duration, true);
            _telemetryService.TrackEvent("WeatherForecast.Deleted", new Dictionary<string, string>
            {
                ["Id"] = id.ToString()
            });

            // Invalidate cache
            _cache.Remove("weather_forecasts_5");

            _logger.LogInformation("Deleted weather forecast with ID {Id}", id);
            return true;
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackDependency("Database", "DeleteWeatherForecast", startTime, duration, false);
            _telemetryService.TrackException(ex, new Dictionary<string, string>
            {
                ["Operation"] = "DeleteForecastAsync",
                ["Id"] = id.ToString()
            });

            _logger.LogError(ex, "Failed to delete weather forecast with ID {Id}", id);
            throw;
        }
    }
}

/// <summary>
/// Custom health check for business logic validation
/// Interview Talking Point: "Custom health checks validate business-critical dependencies
/// and provide early warning of potential issues before they affect users"
/// </summary>
public class CustomHealthCheck : IHealthCheck
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<CustomHealthCheck> _logger;

    public CustomHealthCheck(ApplicationDbContext context, ILogger<CustomHealthCheck> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            // Check if we can query the database
            var count = await _context.WeatherForecasts.CountAsync(cancellationToken);
            
            // Check if we have recent data (within last 30 days)
            var recentDataExists = await _context.WeatherForecasts
                .AnyAsync(f => f.Date >= DateOnly.FromDateTime(DateTime.Now.AddDays(-30)), cancellationToken);

            var data = new Dictionary<string, object>
            {
                ["TotalForecasts"] = count,
                ["HasRecentData"] = recentDataExists,
                ["CheckTime"] = DateTime.UtcNow
            };

            if (!recentDataExists && count > 0)
            {
                return HealthCheckResult.Degraded("No recent weather data available", data: data);
            }

            return HealthCheckResult.Healthy("Custom health check passed", data: data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Custom health check failed");
            return HealthCheckResult.Unhealthy("Custom health check failed", ex);
        }
    }
}
