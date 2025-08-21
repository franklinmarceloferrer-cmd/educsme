using EduCMS.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace EduCMS.Infrastructure.Configurations;

/// <summary>
/// Entity Framework configuration for Student entity
/// </summary>
public class StudentConfiguration : IEntityTypeConfiguration<Student>
{
    public void Configure(EntityTypeBuilder<Student> builder)
    {
        // Table name
        builder.ToTable("Students");

        // Primary key
        builder.HasKey(s => s.Id);

        // Properties configuration
        builder.Property(s => s.StudentId)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(s => s.Grade)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(s => s.Section)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(s => s.PhoneNumber)
            .HasMaxLength(20);

        builder.Property(s => s.Address)
            .HasMaxLength(500);

        builder.Property(s => s.EmergencyContact)
            .HasMaxLength(200);

        builder.Property(s => s.Notes)
            .HasMaxLength(1000);

        builder.Property(s => s.AvatarUrl)
            .HasMaxLength(500);

        // Indexes
        builder.HasIndex(s => s.StudentId)
            .IsUnique()
            .HasDatabaseName("IX_Students_StudentId");

        builder.HasIndex(s => s.Email)
            .IsUnique()
            .HasDatabaseName("IX_Students_Email");

        builder.HasIndex(s => s.Grade)
            .HasDatabaseName("IX_Students_Grade");

        builder.HasIndex(s => s.Status)
            .HasDatabaseName("IX_Students_Status");

        builder.HasIndex(s => s.EnrollmentDate)
            .HasDatabaseName("IX_Students_EnrollmentDate");

        // Enum conversion
        builder.Property(s => s.Status)
            .HasConversion<int>();

        // Default values
        builder.Property(s => s.Status)
            .HasDefaultValue(StudentStatus.Active);

        builder.Property(s => s.EnrollmentDate)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(s => s.CreatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(s => s.UpdatedAt)
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(s => s.IsDeleted)
            .HasDefaultValue(false);
    }
}
