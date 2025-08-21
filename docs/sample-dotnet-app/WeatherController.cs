using Microsoft.AspNetCore.Mvc;
using MyApp.Models;
using MyApp.Services;
using System.ComponentModel.DataAnnotations;

namespace MyApp.Controllers;

/// <summary>
/// Weather forecast API controller with enterprise patterns
/// Interview Talking Point: "This controller demonstrates proper API design with
/// consistent response patterns, validation, error handling, and comprehensive logging"
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class WeatherController : ControllerBase
{
    private readonly IWeatherService _weatherService;
    private readonly ITelemetryService _telemetryService;
    private readonly ILogger<WeatherController> _logger;

    public WeatherController(
        IWeatherService weatherService,
        ITelemetryService telemetryService,
        ILogger<WeatherController> logger)
    {
        _weatherService = weatherService;
        _telemetryService = telemetryService;
        _logger = logger;
    }

    /// <summary>
    /// Get weather forecasts
    /// </summary>
    /// <param name="days">Number of days to forecast (1-30)</param>
    /// <returns>List of weather forecasts</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<WeatherForecast>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<IEnumerable<WeatherForecast>>>> GetForecasts(
        [FromQuery, Range(1, 30)] int days = 5)
    {
        var startTime = DateTimeOffset.UtcNow;
        
        try
        {
            _logger.LogInformation("Getting weather forecasts for {Days} days", days);
            
            var forecasts = await _weatherService.GetForecastsAsync(days);
            
            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackRequest("GET /api/weather", startTime, duration, "200", true);
            _telemetryService.TrackMetric("WeatherController.GetForecasts.Duration", duration.TotalMilliseconds);
            
            return Ok(ApiResponse<IEnumerable<WeatherForecast>>.SuccessResult(
                forecasts, 
                $"Retrieved {forecasts.Count()} weather forecasts"));
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackRequest("GET /api/weather", startTime, duration, "500", false);
            _telemetryService.TrackException(ex, new Dictionary<string, string>
            {
                ["Controller"] = "WeatherController",
                ["Action"] = "GetForecasts",
                ["Days"] = days.ToString()
            });
            
            _logger.LogError(ex, "Failed to get weather forecasts for {Days} days", days);
            
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResult("An error occurred while retrieving weather forecasts"));
        }
    }

    /// <summary>
    /// Get weather forecast by ID
    /// </summary>
    /// <param name="id">Forecast ID</param>
    /// <returns>Weather forecast</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<WeatherForecast>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<WeatherForecast>>> GetForecast(int id)
    {
        var startTime = DateTimeOffset.UtcNow;
        
        try
        {
            _logger.LogInformation("Getting weather forecast with ID {Id}", id);
            
            var forecast = await _weatherService.GetForecastByIdAsync(id);
            
            if (forecast == null)
            {
                var duration = DateTimeOffset.UtcNow - startTime;
                _telemetryService.TrackRequest($"GET /api/weather/{id}", startTime, duration, "404", false);
                
                return NotFound(ApiResponse<object>.ErrorResult($"Weather forecast with ID {id} not found"));
            }
            
            var successDuration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackRequest($"GET /api/weather/{id}", startTime, successDuration, "200", true);
            
            return Ok(ApiResponse<WeatherForecast>.SuccessResult(forecast));
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackRequest($"GET /api/weather/{id}", startTime, duration, "500", false);
            _telemetryService.TrackException(ex, new Dictionary<string, string>
            {
                ["Controller"] = "WeatherController",
                ["Action"] = "GetForecast",
                ["Id"] = id.ToString()
            });
            
            _logger.LogError(ex, "Failed to get weather forecast with ID {Id}", id);
            
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResult("An error occurred while retrieving the weather forecast"));
        }
    }

    /// <summary>
    /// Create a new weather forecast
    /// </summary>
    /// <param name="request">Weather forecast data</param>
    /// <returns>Created weather forecast</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<WeatherForecast>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<WeatherForecast>>> CreateForecast(
        [FromBody] CreateWeatherForecastRequest request)
    {
        var startTime = DateTimeOffset.UtcNow;
        
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);
                
                return BadRequest(ApiResponse<object>.ErrorResult("Validation failed", errors));
            }
            
            _logger.LogInformation("Creating weather forecast for date {Date}", request.Date);
            
            var forecast = new WeatherForecast
            {
                Date = request.Date,
                TemperatureC = request.TemperatureC,
                Summary = request.Summary
            };
            
            var createdForecast = await _weatherService.CreateForecastAsync(forecast);
            
            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackRequest("POST /api/weather", startTime, duration, "201", true);
            _telemetryService.TrackEvent("WeatherForecast.Created", new Dictionary<string, string>
            {
                ["Id"] = createdForecast.Id.ToString(),
                ["Date"] = createdForecast.Date.ToString()
            });
            
            return CreatedAtAction(
                nameof(GetForecast),
                new { id = createdForecast.Id },
                ApiResponse<WeatherForecast>.SuccessResult(createdForecast, "Weather forecast created successfully"));
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackRequest("POST /api/weather", startTime, duration, "500", false);
            _telemetryService.TrackException(ex, new Dictionary<string, string>
            {
                ["Controller"] = "WeatherController",
                ["Action"] = "CreateForecast"
            });
            
            _logger.LogError(ex, "Failed to create weather forecast");
            
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResult("An error occurred while creating the weather forecast"));
        }
    }

    /// <summary>
    /// Update an existing weather forecast
    /// </summary>
    /// <param name="id">Forecast ID</param>
    /// <param name="request">Updated weather forecast data</param>
    /// <returns>Updated weather forecast</returns>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<object>>> UpdateForecast(
        int id,
        [FromBody] UpdateWeatherForecastRequest request)
    {
        var startTime = DateTimeOffset.UtcNow;
        
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);
                
                return BadRequest(ApiResponse<object>.ErrorResult("Validation failed", errors));
            }
            
            _logger.LogInformation("Updating weather forecast with ID {Id}", id);
            
            var forecast = new WeatherForecast
            {
                Date = request.Date,
                TemperatureC = request.TemperatureC,
                Summary = request.Summary
            };
            
            var updated = await _weatherService.UpdateForecastAsync(id, forecast);
            
            if (!updated)
            {
                var duration = DateTimeOffset.UtcNow - startTime;
                _telemetryService.TrackRequest($"PUT /api/weather/{id}", startTime, duration, "404", false);
                
                return NotFound(ApiResponse<object>.ErrorResult($"Weather forecast with ID {id} not found"));
            }
            
            var successDuration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackRequest($"PUT /api/weather/{id}", startTime, successDuration, "200", true);
            
            return Ok(ApiResponse<object>.SuccessResult(null, "Weather forecast updated successfully"));
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackRequest($"PUT /api/weather/{id}", startTime, duration, "500", false);
            _telemetryService.TrackException(ex, new Dictionary<string, string>
            {
                ["Controller"] = "WeatherController",
                ["Action"] = "UpdateForecast",
                ["Id"] = id.ToString()
            });
            
            _logger.LogError(ex, "Failed to update weather forecast with ID {Id}", id);
            
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResult("An error occurred while updating the weather forecast"));
        }
    }

    /// <summary>
    /// Delete a weather forecast
    /// </summary>
    /// <param name="id">Forecast ID</param>
    /// <returns>Deletion result</returns>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<object>>> DeleteForecast(int id)
    {
        var startTime = DateTimeOffset.UtcNow;
        
        try
        {
            _logger.LogInformation("Deleting weather forecast with ID {Id}", id);
            
            var deleted = await _weatherService.DeleteForecastAsync(id);
            
            if (!deleted)
            {
                var duration = DateTimeOffset.UtcNow - startTime;
                _telemetryService.TrackRequest($"DELETE /api/weather/{id}", startTime, duration, "404", false);
                
                return NotFound(ApiResponse<object>.ErrorResult($"Weather forecast with ID {id} not found"));
            }
            
            var successDuration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackRequest($"DELETE /api/weather/{id}", startTime, successDuration, "200", true);
            
            return Ok(ApiResponse<object>.SuccessResult(null, "Weather forecast deleted successfully"));
        }
        catch (Exception ex)
        {
            var duration = DateTimeOffset.UtcNow - startTime;
            _telemetryService.TrackRequest($"DELETE /api/weather/{id}", startTime, duration, "500", false);
            _telemetryService.TrackException(ex, new Dictionary<string, string>
            {
                ["Controller"] = "WeatherController",
                ["Action"] = "DeleteForecast",
                ["Id"] = id.ToString()
            });
            
            _logger.LogError(ex, "Failed to delete weather forecast with ID {Id}", id);
            
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResult("An error occurred while deleting the weather forecast"));
        }
    }
}

/// <summary>
/// Request model for creating weather forecasts
/// Interview Talking Point: "Separate request/response models provide better API versioning
/// and validation control compared to using entity models directly"
/// </summary>
public class CreateWeatherForecastRequest
{
    [Required]
    public DateOnly Date { get; set; }
    
    [Required]
    [Range(-50, 60, ErrorMessage = "Temperature must be between -50 and 60 degrees Celsius")]
    public int TemperatureC { get; set; }
    
    [StringLength(200, ErrorMessage = "Summary cannot exceed 200 characters")]
    public string? Summary { get; set; }
}

/// <summary>
/// Request model for updating weather forecasts
/// </summary>
public class UpdateWeatherForecastRequest
{
    [Required]
    public DateOnly Date { get; set; }
    
    [Required]
    [Range(-50, 60, ErrorMessage = "Temperature must be between -50 and 60 degrees Celsius")]
    public int TemperatureC { get; set; }
    
    [StringLength(200, ErrorMessage = "Summary cannot exceed 200 characters")]
    public string? Summary { get; set; }
}
