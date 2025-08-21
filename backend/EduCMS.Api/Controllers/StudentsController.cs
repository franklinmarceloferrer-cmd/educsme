using AutoMapper;
using EduCMS.Api.Models;
using EduCMS.Core.Entities;
using EduCMS.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace EduCMS.Api.Controllers;

/// <summary>
/// API controller for student management operations
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Produces("application/json")]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _studentService;
    private readonly IMapper _mapper;
    private readonly ILogger<StudentsController> _logger;

    public StudentsController(
        IStudentService studentService,
        IMapper mapper,
        ILogger<StudentsController> logger)
    {
        _studentService = studentService ?? throw new ArgumentNullException(nameof(studentService));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Get all students with optional filtering and pagination
    /// </summary>
    /// <param name="pageNumber">Page number (1-based)</param>
    /// <param name="pageSize">Number of items per page (1-100)</param>
    /// <param name="searchTerm">Search term for name, email, or student ID</param>
    /// <param name="grade">Filter by grade</param>
    /// <param name="status">Filter by status</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paged list of students</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResponse<StudentDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<PagedResponse<StudentDto>>>> GetStudents(
        [FromQuery, Range(1, int.MaxValue)] int pageNumber = 1,
        [FromQuery, Range(1, 100)] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] string? grade = null,
        [FromQuery] StudentStatus? status = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Getting students - Page: {PageNumber}, Size: {PageSize}, Search: {SearchTerm}, Grade: {Grade}, Status: {Status}",
                pageNumber, pageSize, searchTerm, grade, status);

            var result = await _studentService.GetStudentsAsync(
                pageNumber, pageSize, searchTerm, grade, status, cancellationToken);

            var studentDtos = _mapper.Map<IEnumerable<StudentDto>>(result.Items);

            var response = new PagedResponse<StudentDto>
            {
                Items = studentDtos,
                TotalCount = result.TotalCount,
                PageNumber = result.PageNumber,
                PageSize = result.PageSize,
                TotalPages = result.TotalPages,
                HasPreviousPage = result.HasPreviousPage,
                HasNextPage = result.HasNextPage
            };

            return Ok(ApiResponse<PagedResponse<StudentDto>>.SuccessResult(response));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting students");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResult("An error occurred while retrieving students"));
        }
    }

    /// <summary>
    /// Get student by ID
    /// </summary>
    /// <param name="id">Student ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Student details</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<StudentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<StudentDto>>> GetStudent(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Getting student with ID: {StudentId}", id);

            var student = await _studentService.GetStudentByIdAsync(id, cancellationToken);
            if (student == null)
            {
                return NotFound(ApiResponse<object>.ErrorResult($"Student with ID {id} not found"));
            }

            var studentDto = _mapper.Map<StudentDto>(student);
            return Ok(ApiResponse<StudentDto>.SuccessResult(studentDto));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting student with ID: {StudentId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResult("An error occurred while retrieving the student"));
        }
    }

    /// <summary>
    /// Create a new student
    /// </summary>
    /// <param name="createStudentDto">Student creation data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created student</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<StudentDto>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<StudentDto>>> CreateStudent(
        [FromBody] CreateStudentDto createStudentDto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);
                return BadRequest(ApiResponse<object>.ErrorResult("Validation failed", errors));
            }

            _logger.LogInformation("Creating student: {StudentId} - {Name}", createStudentDto.StudentId, createStudentDto.Name);

            var student = _mapper.Map<Student>(createStudentDto);
            
            // Set defaults if not provided
            student.EnrollmentDate = createStudentDto.EnrollmentDate ?? DateTime.UtcNow;
            student.Status = createStudentDto.Status ?? StudentStatus.Active;

            var createdStudent = await _studentService.CreateStudentAsync(student, cancellationToken);
            var studentDto = _mapper.Map<StudentDto>(createdStudent);

            return CreatedAtAction(
                nameof(GetStudent),
                new { id = createdStudent.Id },
                ApiResponse<StudentDto>.SuccessResult(studentDto, "Student created successfully"));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error creating student");
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating student");
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResult("An error occurred while creating the student"));
        }
    }

    /// <summary>
    /// Update an existing student
    /// </summary>
    /// <param name="id">Student ID</param>
    /// <param name="updateStudentDto">Student update data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated student</returns>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<StudentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<StudentDto>>> UpdateStudent(
        Guid id,
        [FromBody] UpdateStudentDto updateStudentDto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);
                return BadRequest(ApiResponse<object>.ErrorResult("Validation failed", errors));
            }

            _logger.LogInformation("Updating student with ID: {StudentId}", id);

            var student = _mapper.Map<Student>(updateStudentDto);
            var updatedStudent = await _studentService.UpdateStudentAsync(id, student, cancellationToken);

            if (updatedStudent == null)
            {
                return NotFound(ApiResponse<object>.ErrorResult($"Student with ID {id} not found"));
            }

            var studentDto = _mapper.Map<StudentDto>(updatedStudent);
            return Ok(ApiResponse<StudentDto>.SuccessResult(studentDto, "Student updated successfully"));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error updating student");
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating student with ID: {StudentId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResult("An error occurred while updating the student"));
        }
    }

    /// <summary>
    /// Delete a student (soft delete)
    /// </summary>
    /// <param name="id">Student ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success confirmation</returns>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<object>>> DeleteStudent(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Deleting student with ID: {StudentId}", id);

            var deleted = await _studentService.DeleteStudentAsync(id, cancellationToken);
            if (!deleted)
            {
                return NotFound(ApiResponse<object>.ErrorResult($"Student with ID {id} not found"));
            }

            return Ok(ApiResponse<object>.SuccessResult(new { }, "Student deleted successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting student with ID: {StudentId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResult("An error occurred while deleting the student"));
        }
    }

    /// <summary>
    /// Update student avatar
    /// </summary>
    /// <param name="id">Student ID</param>
    /// <param name="updateAvatarDto">Avatar update data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success confirmation</returns>
    [HttpPatch("{id:guid}/avatar")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<ApiResponse<object>>> UpdateStudentAvatar(
        Guid id,
        [FromBody] UpdateStudentAvatarDto updateAvatarDto,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);
                return BadRequest(ApiResponse<object>.ErrorResult("Validation failed", errors));
            }

            _logger.LogInformation("Updating avatar for student with ID: {StudentId}", id);

            var updated = await _studentService.UpdateStudentAvatarAsync(id, updateAvatarDto.AvatarUrl, cancellationToken);
            if (!updated)
            {
                return NotFound(ApiResponse<object>.ErrorResult($"Student with ID {id} not found"));
            }

            return Ok(ApiResponse<object>.SuccessResult(new { }, "Student avatar updated successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating avatar for student with ID: {StudentId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse<object>.ErrorResult("An error occurred while updating the student avatar"));
        }
    }
}
