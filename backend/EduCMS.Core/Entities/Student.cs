namespace EduCMS.Core.Entities;

/// <summary>
/// Student entity representing a student in the educational system
/// </summary>
public class Student : BaseEntity
{
    /// <summary>
    /// Student's unique identifier (student ID)
    /// </summary>
    public string StudentId { get; set; } = string.Empty;

    /// <summary>
    /// Student's full name
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Student's email address
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Student's grade level
    /// </summary>
    public string Grade { get; set; } = string.Empty;

    /// <summary>
    /// Student's section or class
    /// </summary>
    public string Section { get; set; } = string.Empty;

    /// <summary>
    /// Date when the student enrolled
    /// </summary>
    public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Student's current status (active, inactive, graduated, etc.)
    /// </summary>
    public StudentStatus Status { get; set; } = StudentStatus.Active;

    /// <summary>
    /// URL to the student's avatar/profile picture
    /// </summary>
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// Student's phone number
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Student's address
    /// </summary>
    public string? Address { get; set; }

    /// <summary>
    /// Date of birth
    /// </summary>
    public DateTime? DateOfBirth { get; set; }

    /// <summary>
    /// Emergency contact information
    /// </summary>
    public string? EmergencyContact { get; set; }

    /// <summary>
    /// Additional notes about the student
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Enumeration of possible student statuses
/// </summary>
public enum StudentStatus
{
    Active = 1,
    Inactive = 2,
    Suspended = 3,
    Graduated = 4,
    Transferred = 5,
    Withdrawn = 6
}
