using EduCMS.Core.Entities;
using System.ComponentModel.DataAnnotations;

namespace EduCMS.Api.Models;

/// <summary>
/// Data Transfer Object for Student entity
/// </summary>
public class StudentDto
{
    /// <summary>
    /// Unique identifier for the student
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Student's unique identifier (student ID)
    /// </summary>
    [Required]
    [StringLength(20, MinimumLength = 1)]
    public string StudentId { get; set; } = string.Empty;

    /// <summary>
    /// Student's full name
    /// </summary>
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Student's email address
    /// </summary>
    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Student's grade level
    /// </summary>
    [Required]
    [StringLength(10, MinimumLength = 1)]
    public string Grade { get; set; } = string.Empty;

    /// <summary>
    /// Student's section or class
    /// </summary>
    [Required]
    [StringLength(10, MinimumLength = 1)]
    public string Section { get; set; } = string.Empty;

    /// <summary>
    /// Date when the student enrolled
    /// </summary>
    public DateTime EnrollmentDate { get; set; }

    /// <summary>
    /// Student's current status
    /// </summary>
    public StudentStatus Status { get; set; }

    /// <summary>
    /// URL to the student's avatar/profile picture
    /// </summary>
    [StringLength(500)]
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// Student's phone number
    /// </summary>
    [Phone]
    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Student's address
    /// </summary>
    [StringLength(500)]
    public string? Address { get; set; }

    /// <summary>
    /// Date of birth
    /// </summary>
    public DateTime? DateOfBirth { get; set; }

    /// <summary>
    /// Emergency contact information
    /// </summary>
    [StringLength(200)]
    public string? EmergencyContact { get; set; }

    /// <summary>
    /// Additional notes about the student
    /// </summary>
    [StringLength(1000)]
    public string? Notes { get; set; }

    /// <summary>
    /// Date and time when the student record was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Date and time when the student record was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// Data Transfer Object for creating a new student
/// </summary>
public class CreateStudentDto
{
    /// <summary>
    /// Student's unique identifier (student ID)
    /// </summary>
    [Required]
    [StringLength(20, MinimumLength = 1)]
    public string StudentId { get; set; } = string.Empty;

    /// <summary>
    /// Student's full name
    /// </summary>
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Student's email address
    /// </summary>
    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Student's grade level
    /// </summary>
    [Required]
    [StringLength(10, MinimumLength = 1)]
    public string Grade { get; set; } = string.Empty;

    /// <summary>
    /// Student's section or class
    /// </summary>
    [Required]
    [StringLength(10, MinimumLength = 1)]
    public string Section { get; set; } = string.Empty;

    /// <summary>
    /// Date when the student enrolled (optional, defaults to current date)
    /// </summary>
    public DateTime? EnrollmentDate { get; set; }

    /// <summary>
    /// Student's current status (optional, defaults to Active)
    /// </summary>
    public StudentStatus? Status { get; set; }

    /// <summary>
    /// Student's phone number
    /// </summary>
    [Phone]
    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Student's address
    /// </summary>
    [StringLength(500)]
    public string? Address { get; set; }

    /// <summary>
    /// Date of birth
    /// </summary>
    public DateTime? DateOfBirth { get; set; }

    /// <summary>
    /// Emergency contact information
    /// </summary>
    [StringLength(200)]
    public string? EmergencyContact { get; set; }

    /// <summary>
    /// Additional notes about the student
    /// </summary>
    [StringLength(1000)]
    public string? Notes { get; set; }
}

/// <summary>
/// Data Transfer Object for updating an existing student
/// </summary>
public class UpdateStudentDto
{
    /// <summary>
    /// Student's unique identifier (student ID)
    /// </summary>
    [Required]
    [StringLength(20, MinimumLength = 1)]
    public string StudentId { get; set; } = string.Empty;

    /// <summary>
    /// Student's full name
    /// </summary>
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Student's email address
    /// </summary>
    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Student's grade level
    /// </summary>
    [Required]
    [StringLength(10, MinimumLength = 1)]
    public string Grade { get; set; } = string.Empty;

    /// <summary>
    /// Student's section or class
    /// </summary>
    [Required]
    [StringLength(10, MinimumLength = 1)]
    public string Section { get; set; } = string.Empty;

    /// <summary>
    /// Student's current status
    /// </summary>
    public StudentStatus Status { get; set; }

    /// <summary>
    /// Student's phone number
    /// </summary>
    [Phone]
    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Student's address
    /// </summary>
    [StringLength(500)]
    public string? Address { get; set; }

    /// <summary>
    /// Date of birth
    /// </summary>
    public DateTime? DateOfBirth { get; set; }

    /// <summary>
    /// Emergency contact information
    /// </summary>
    [StringLength(200)]
    public string? EmergencyContact { get; set; }

    /// <summary>
    /// Additional notes about the student
    /// </summary>
    [StringLength(1000)]
    public string? Notes { get; set; }
}

/// <summary>
/// Data Transfer Object for updating student avatar
/// </summary>
public class UpdateStudentAvatarDto
{
    /// <summary>
    /// URL to the student's new avatar/profile picture
    /// </summary>
    [Required]
    [Url]
    [StringLength(500)]
    public string AvatarUrl { get; set; } = string.Empty;
}

/// <summary>
/// Data Transfer Object for student statistics
/// </summary>
public class StudentStatisticsDto
{
    public int TotalStudents { get; set; }
    public int ActiveStudents { get; set; }
    public int InactiveStudents { get; set; }
    public int GraduatedStudents { get; set; }
    public Dictionary<string, int> StudentsByGrade { get; set; } = new();
    public Dictionary<string, int> StudentsByStatus { get; set; } = new();
    public int NewStudentsThisMonth { get; set; }
    public int NewStudentsThisYear { get; set; }
}

/// <summary>
/// Generic API response wrapper
/// </summary>
/// <typeparam name="T">Response data type</typeparam>
public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
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
/// Paged response wrapper
/// </summary>
/// <typeparam name="T">Item type</typeparam>
public class PagedResponse<T>
{
    public IEnumerable<T> Items { get; set; } = Enumerable.Empty<T>();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage { get; set; }
    public bool HasNextPage { get; set; }
}
