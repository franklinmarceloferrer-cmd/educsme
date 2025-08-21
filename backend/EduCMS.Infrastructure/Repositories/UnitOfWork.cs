using EduCMS.Core.Entities;
using EduCMS.Core.Interfaces;
using EduCMS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace EduCMS.Infrastructure.Repositories;

/// <summary>
/// Unit of Work implementation using Entity Framework
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly EduCMSDbContext _context;
    private IDbContextTransaction? _transaction;
    private bool _disposed = false;

    // Lazy-loaded repositories
    private IRepository<Student>? _students;
    private IRepository<Announcement>? _announcements;
    private IRepository<Document>? _documents;
    private IRepository<AnnouncementAttachment>? _announcementAttachments;

    public UnitOfWork(EduCMSDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public IRepository<Student> Students =>
        _students ??= new Repository<Student>(_context);

    public IRepository<Announcement> Announcements =>
        _announcements ??= new Repository<Announcement>(_context);

    public IRepository<Document> Documents =>
        _documents ??= new Repository<Document>(_context);

    public IRepository<AnnouncementAttachment> AnnouncementAttachments =>
        _announcementAttachments ??= new Repository<AnnouncementAttachment>(_context);

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }
        catch (Exception)
        {
            // Log the exception here if needed
            throw;
        }
    }

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction != null)
        {
            throw new InvalidOperationException("A transaction is already in progress.");
        }

        _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction == null)
        {
            throw new InvalidOperationException("No transaction is in progress.");
        }

        try
        {
            await _transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await RollbackTransactionAsync(cancellationToken);
            throw;
        }
        finally
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (_transaction == null)
        {
            throw new InvalidOperationException("No transaction is in progress.");
        }

        try
        {
            await _transaction.RollbackAsync(cancellationToken);
        }
        finally
        {
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposed && disposing)
        {
            _transaction?.Dispose();
            _context.Dispose();
            _disposed = true;
        }
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }
}
