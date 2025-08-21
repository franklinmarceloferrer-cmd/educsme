using EduCMS.Core.Entities;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace EduCMS.Infrastructure.Data;

/// <summary>
/// Entity Framework DbContext for EduCMS application
/// </summary>
public class EduCMSDbContext : DbContext
{
    public EduCMSDbContext(DbContextOptions<EduCMSDbContext> options) : base(options)
    {
    }

    /// <summary>
    /// Students DbSet
    /// </summary>
    public DbSet<Student> Students { get; set; }

    /// <summary>
    /// Announcements DbSet
    /// </summary>
    public DbSet<Announcement> Announcements { get; set; }

    /// <summary>
    /// Documents DbSet
    /// </summary>
    public DbSet<Document> Documents { get; set; }

    /// <summary>
    /// Announcement attachments DbSet
    /// </summary>
    public DbSet<AnnouncementAttachment> AnnouncementAttachments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations from the current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

        // Configure global query filters for soft delete
        ConfigureGlobalQueryFilters(modelBuilder);

        // Seed initial data
        SeedData(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Update timestamps before saving
        UpdateTimestamps();
        return await base.SaveChangesAsync(cancellationToken);
    }

    public override int SaveChanges()
    {
        // Update timestamps before saving
        UpdateTimestamps();
        return base.SaveChanges();
    }

    private void UpdateTimestamps()
    {
        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    // Prevent modification of CreatedAt
                    entry.Property(e => e.CreatedAt).IsModified = false;
                    break;
            }

            // Handle soft delete
            if (entry.Entity.IsDeleted && entry.Entity.DeletedAt == null)
            {
                entry.Entity.DeletedAt = DateTime.UtcNow;
            }
        }
    }

    private static void ConfigureGlobalQueryFilters(ModelBuilder modelBuilder)
    {
        // Configure global query filter for soft delete
        modelBuilder.Entity<Student>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Announcement>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<Document>().HasQueryFilter(e => !e.IsDeleted);
        modelBuilder.Entity<AnnouncementAttachment>().HasQueryFilter(e => !e.IsDeleted);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Seed sample students
        var students = new[]
        {
            new Student
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                StudentId = "STU001",
                Name = "John Doe",
                Email = "john.doe@school.edu",
                Grade = "10",
                Section = "A",
                Status = StudentStatus.Active,
                EnrollmentDate = DateTime.UtcNow.AddMonths(-6),
                CreatedAt = DateTime.UtcNow.AddMonths(-6),
                UpdatedAt = DateTime.UtcNow.AddMonths(-6)
            },
            new Student
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                StudentId = "STU002",
                Name = "Jane Smith",
                Email = "jane.smith@school.edu",
                Grade = "11",
                Section = "B",
                Status = StudentStatus.Active,
                EnrollmentDate = DateTime.UtcNow.AddMonths(-8),
                CreatedAt = DateTime.UtcNow.AddMonths(-8),
                UpdatedAt = DateTime.UtcNow.AddMonths(-8)
            }
        };

        modelBuilder.Entity<Student>().HasData(students);

        // Seed sample announcements
        var announcements = new[]
        {
            new Announcement
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Title = "Welcome to the New Academic Year",
                Content = "<p>We are excited to welcome all students to the new academic year. Please review the updated policies and procedures.</p>",
                Category = AnnouncementCategory.General,
                Priority = AnnouncementPriority.High,
                AuthorId = "admin",
                AuthorName = "System Administrator",
                IsPublished = true,
                CreatedAt = DateTime.UtcNow.AddDays(-7),
                UpdatedAt = DateTime.UtcNow.AddDays(-7)
            }
        };

        modelBuilder.Entity<Announcement>().HasData(announcements);
    }
}
