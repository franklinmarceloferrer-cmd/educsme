using EduCMS.Core.Entities;
using EduCMS.Core.Interfaces;
using System.Text;

namespace EduCMS.Core.Services;

/// <summary>
/// Business logic service for student operations
/// </summary>
public class StudentService : IStudentService
{
    private readonly IUnitOfWork _unitOfWork;

    public StudentService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<PagedResult<Student>> GetStudentsAsync(
        int pageNumber = 1,
        int pageSize = 20,
        string? searchTerm = null,
        string? grade = null,
        StudentStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        // Build the filter predicate
        var predicate = BuildStudentFilter(searchTerm, grade, status);

        // Define ordering
        static IOrderedQueryable<Student> OrderBy(IQueryable<Student> query) =>
            query.OrderBy(s => s.Name).ThenBy(s => s.StudentId);

        return await _unitOfWork.Students.GetPagedAsync(
            pageNumber,
            pageSize,
            predicate,
            OrderBy,
            cancellationToken);
    }

    public async Task<Student?> GetStudentByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Students.GetByIdAsync(id, cancellationToken);
    }

    public async Task<Student?> GetStudentByStudentIdAsync(string studentId, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            return null;

        return await _unitOfWork.Students.FindFirstAsync(
            s => s.StudentId == studentId,
            cancellationToken);
    }

    public async Task<Student> CreateStudentAsync(Student student, CancellationToken cancellationToken = default)
    {
        if (student == null)
            throw new ArgumentNullException(nameof(student));

        // Validate business rules
        await ValidateStudentAsync(student, cancellationToken);

        // Create the student
        var createdStudent = await _unitOfWork.Students.AddAsync(student, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return createdStudent;
    }

    public async Task<Student?> UpdateStudentAsync(Guid id, Student student, CancellationToken cancellationToken = default)
    {
        if (student == null)
            throw new ArgumentNullException(nameof(student));

        var existingStudent = await _unitOfWork.Students.GetByIdAsync(id, cancellationToken);
        if (existingStudent == null)
            return null;

        // Validate business rules
        await ValidateStudentAsync(student, id, cancellationToken);

        // Update properties
        existingStudent.StudentId = student.StudentId;
        existingStudent.Name = student.Name;
        existingStudent.Email = student.Email;
        existingStudent.Grade = student.Grade;
        existingStudent.Section = student.Section;
        existingStudent.Status = student.Status;
        existingStudent.PhoneNumber = student.PhoneNumber;
        existingStudent.Address = student.Address;
        existingStudent.DateOfBirth = student.DateOfBirth;
        existingStudent.EmergencyContact = student.EmergencyContact;
        existingStudent.Notes = student.Notes;

        await _unitOfWork.Students.UpdateAsync(existingStudent, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return existingStudent;
    }

    public async Task<bool> DeleteStudentAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var student = await _unitOfWork.Students.GetByIdAsync(id, cancellationToken);
        if (student == null)
            return false;

        await _unitOfWork.Students.SoftDeleteAsync(student, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> UpdateStudentAvatarAsync(Guid id, string avatarUrl, CancellationToken cancellationToken = default)
    {
        var student = await _unitOfWork.Students.GetByIdAsync(id, cancellationToken);
        if (student == null)
            return false;

        student.AvatarUrl = avatarUrl;
        await _unitOfWork.Students.UpdateAsync(student, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<StudentStatistics> GetStudentStatisticsAsync(CancellationToken cancellationToken = default)
    {
        var allStudents = await _unitOfWork.Students.GetAllAsync(cancellationToken: cancellationToken);
        var studentList = allStudents.ToList();

        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1);
        var startOfYear = new DateTime(now.Year, 1, 1);

        return new StudentStatistics
        {
            TotalStudents = studentList.Count,
            ActiveStudents = studentList.Count(s => s.Status == StudentStatus.Active),
            InactiveStudents = studentList.Count(s => s.Status == StudentStatus.Inactive),
            GraduatedStudents = studentList.Count(s => s.Status == StudentStatus.Graduated),
            StudentsByGrade = studentList.GroupBy(s => s.Grade)
                .ToDictionary(g => g.Key, g => g.Count()),
            StudentsByStatus = studentList.GroupBy(s => s.Status)
                .ToDictionary(g => g.Key, g => g.Count()),
            NewStudentsThisMonth = studentList.Count(s => s.EnrollmentDate >= startOfMonth),
            NewStudentsThisYear = studentList.Count(s => s.EnrollmentDate >= startOfYear)
        };
    }

    public async Task<bool> IsStudentIdUniqueAsync(string studentId, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(studentId))
            return false;

        var exists = await _unitOfWork.Students.AnyAsync(
            s => s.StudentId == studentId && (excludeId == null || s.Id != excludeId),
            cancellationToken);

        return !exists;
    }

    public async Task<bool> IsEmailUniqueAsync(string email, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        var exists = await _unitOfWork.Students.AnyAsync(
            s => s.Email == email && (excludeId == null || s.Id != excludeId),
            cancellationToken);

        return !exists;
    }

    public async Task<byte[]> ExportStudentsToCsvAsync(
        string? searchTerm = null,
        string? grade = null,
        StudentStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        var predicate = BuildStudentFilter(searchTerm, grade, status);
        var students = await _unitOfWork.Students.GetAllAsync(predicate, cancellationToken);

        var csv = new StringBuilder();
        csv.AppendLine("Student ID,Name,Email,Grade,Section,Status,Enrollment Date,Phone,Address");

        foreach (var student in students.OrderBy(s => s.Name))
        {
            csv.AppendLine($"{EscapeCsvField(student.StudentId)}," +
                          $"{EscapeCsvField(student.Name)}," +
                          $"{EscapeCsvField(student.Email)}," +
                          $"{EscapeCsvField(student.Grade)}," +
                          $"{EscapeCsvField(student.Section)}," +
                          $"{student.Status}," +
                          $"{student.EnrollmentDate:yyyy-MM-dd}," +
                          $"{EscapeCsvField(student.PhoneNumber ?? "")}," +
                          $"{EscapeCsvField(student.Address ?? "")}");
        }

        return Encoding.UTF8.GetBytes(csv.ToString());
    }

    private static System.Linq.Expressions.Expression<Func<Student, bool>>? BuildStudentFilter(
        string? searchTerm,
        string? grade,
        StudentStatus? status)
    {
        System.Linq.Expressions.Expression<Func<Student, bool>>? predicate = null;

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            var search = searchTerm.ToLower();
            predicate = s => s.Name.ToLower().Contains(search) ||
                           s.Email.ToLower().Contains(search) ||
                           s.StudentId.ToLower().Contains(search);
        }

        if (!string.IsNullOrWhiteSpace(grade))
        {
            var gradePredicate = new System.Linq.Expressions.Expression<Func<Student, bool>>(s => s.Grade == grade);
            predicate = predicate == null ? gradePredicate : CombinePredicates(predicate, gradePredicate);
        }

        if (status.HasValue)
        {
            var statusPredicate = new System.Linq.Expressions.Expression<Func<Student, bool>>(s => s.Status == status.Value);
            predicate = predicate == null ? statusPredicate : CombinePredicates(predicate, statusPredicate);
        }

        return predicate;
    }

    private static System.Linq.Expressions.Expression<Func<Student, bool>> CombinePredicates(
        System.Linq.Expressions.Expression<Func<Student, bool>> first,
        System.Linq.Expressions.Expression<Func<Student, bool>> second)
    {
        var parameter = System.Linq.Expressions.Expression.Parameter(typeof(Student), "s");
        var firstBody = new ParameterReplacer(parameter).Visit(first.Body);
        var secondBody = new ParameterReplacer(parameter).Visit(second.Body);
        var combined = System.Linq.Expressions.Expression.AndAlso(firstBody!, secondBody!);
        return System.Linq.Expressions.Expression.Lambda<Func<Student, bool>>(combined, parameter);
    }

    private async Task ValidateStudentAsync(Student student, Guid? excludeId = null, CancellationToken cancellationToken = default)
    {
        var errors = new List<string>();

        // Validate required fields
        if (string.IsNullOrWhiteSpace(student.StudentId))
            errors.Add("Student ID is required.");

        if (string.IsNullOrWhiteSpace(student.Name))
            errors.Add("Name is required.");

        if (string.IsNullOrWhiteSpace(student.Email))
            errors.Add("Email is required.");

        if (string.IsNullOrWhiteSpace(student.Grade))
            errors.Add("Grade is required.");

        if (string.IsNullOrWhiteSpace(student.Section))
            errors.Add("Section is required.");

        // Validate uniqueness
        if (!string.IsNullOrWhiteSpace(student.StudentId))
        {
            var isStudentIdUnique = await IsStudentIdUniqueAsync(student.StudentId, excludeId, cancellationToken);
            if (!isStudentIdUnique)
                errors.Add("Student ID must be unique.");
        }

        if (!string.IsNullOrWhiteSpace(student.Email))
        {
            var isEmailUnique = await IsEmailUniqueAsync(student.Email, excludeId, cancellationToken);
            if (!isEmailUnique)
                errors.Add("Email must be unique.");
        }

        if (errors.Any())
            throw new ArgumentException($"Validation failed: {string.Join(", ", errors)}");
    }

    private static string EscapeCsvField(string field)
    {
        if (string.IsNullOrEmpty(field))
            return "";

        if (field.Contains(',') || field.Contains('"') || field.Contains('\n') || field.Contains('\r'))
        {
            return $"\"{field.Replace("\"", "\"\"")}\"";
        }

        return field;
    }
}

/// <summary>
/// Helper class for combining LINQ expressions
/// </summary>
internal class ParameterReplacer : System.Linq.Expressions.ExpressionVisitor
{
    private readonly System.Linq.Expressions.ParameterExpression _parameter;

    public ParameterReplacer(System.Linq.Expressions.ParameterExpression parameter)
    {
        _parameter = parameter;
    }

    protected override System.Linq.Expressions.Expression VisitParameter(System.Linq.Expressions.ParameterExpression node)
    {
        return _parameter;
    }
}
