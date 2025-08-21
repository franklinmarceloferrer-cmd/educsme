using EduCMS.Core.Entities;

namespace EduCMS.Core.Interfaces;

/// <summary>
/// Unit of Work pattern interface for managing transactions and repositories
/// </summary>
public interface IUnitOfWork : IDisposable
{
    /// <summary>
    /// Students repository
    /// </summary>
    IRepository<Student> Students { get; }

    /// <summary>
    /// Announcements repository
    /// </summary>
    IRepository<Announcement> Announcements { get; }

    /// <summary>
    /// Documents repository
    /// </summary>
    IRepository<Document> Documents { get; }

    /// <summary>
    /// Announcement attachments repository
    /// </summary>
    IRepository<AnnouncementAttachment> AnnouncementAttachments { get; }

    /// <summary>
    /// Save all changes to the database
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Number of affected records</returns>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Begin a database transaction
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Transaction object</returns>
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Commit the current transaction
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task</returns>
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Rollback the current transaction
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task</returns>
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
