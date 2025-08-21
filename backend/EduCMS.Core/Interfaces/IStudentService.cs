using EduCMS.Core.Entities;

namespace EduCMS.Core.Interfaces;

/// <summary>
/// Service interface for student-related business operations
/// </summary>
public interface IStudentService
{
    /// <summary>
    /// Get all students with optional filtering and pagination
    /// </summary>
    /// <param name="pageNumber">Page number (1-based)</param>
    /// <param name="pageSize">Number of items per page</param>
    /// <param name="searchTerm">Optional search term for name, email, or student ID</param>
    /// <param name="grade">Optional grade filter</param>
    /// <param name="status">Optional status filter</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paged result of students</returns>
    Task<PagedResult<Student>> GetStudentsAsync(
        int pageNumber = 1,
        int pageSize = 20,
        string? searchTerm = null,
        string? grade = null,
        StudentStatus? status = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Get student by ID
    /// </summary>
    /// <param name="id">Student ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Student or null if not found</returns>
    Task<Student?> GetStudentByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get student by student ID (unique identifier)
    /// </summary>
    /// <param name="studentId">Student's unique identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Student or null if not found</returns>
    Task<Student?> GetStudentByStudentIdAsync(string studentId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Create a new student
    /// </summary>
    /// <param name="student">Student to create</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created student</returns>
    Task<Student> CreateStudentAsync(Student student, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update an existing student
    /// </summary>
    /// <param name="id">Student ID</param>
    /// <param name="student">Updated student data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated student or null if not found</returns>
    Task<Student?> UpdateStudentAsync(Guid id, Student student, CancellationToken cancellationToken = default);

    /// <summary>
    /// Delete a student (soft delete)
    /// </summary>
    /// <param name="id">Student ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if deleted successfully</returns>
    Task<bool> DeleteStudentAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Update student avatar
    /// </summary>
    /// <param name="id">Student ID</param>
    /// <param name="avatarUrl">New avatar URL</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if updated successfully</returns>
    Task<bool> UpdateStudentAvatarAsync(Guid id, string avatarUrl, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get student statistics
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Student statistics</returns>
    Task<StudentStatistics> GetStudentStatisticsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if student ID is unique
    /// </summary>
    /// <param name="studentId">Student ID to check</param>
    /// <param name="excludeId">Optional ID to exclude from check (for updates)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if student ID is unique</returns>
    Task<bool> IsStudentIdUniqueAsync(string studentId, Guid? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Check if email is unique
    /// </summary>
    /// <param name="email">Email to check</param>
    /// <param name="excludeId">Optional ID to exclude from check (for updates)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if email is unique</returns>
    Task<bool> IsEmailUniqueAsync(string email, Guid? excludeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Export students to CSV format
    /// </summary>
    /// <param name="searchTerm">Optional search term</param>
    /// <param name="grade">Optional grade filter</param>
    /// <param name="status">Optional status filter</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>CSV content as byte array</returns>
    Task<byte[]> ExportStudentsToCsvAsync(
        string? searchTerm = null,
        string? grade = null,
        StudentStatus? status = null,
        CancellationToken cancellationToken = default);
}

/// <summary>
/// Student statistics data transfer object
/// </summary>
public class StudentStatistics
{
    public int TotalStudents { get; set; }
    public int ActiveStudents { get; set; }
    public int InactiveStudents { get; set; }
    public int GraduatedStudents { get; set; }
    public Dictionary<string, int> StudentsByGrade { get; set; } = new();
    public Dictionary<StudentStatus, int> StudentsByStatus { get; set; } = new();
    public int NewStudentsThisMonth { get; set; }
    public int NewStudentsThisYear { get; set; }
}
