namespace EduCMS.Core.Entities;

/// <summary>
/// Announcement entity representing system announcements
/// </summary>
public class Announcement : BaseEntity
{
    /// <summary>
    /// Title of the announcement
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Rich text content of the announcement
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Category of the announcement
    /// </summary>
    public AnnouncementCategory Category { get; set; } = AnnouncementCategory.General;

    /// <summary>
    /// Priority level of the announcement
    /// </summary>
    public AnnouncementPriority Priority { get; set; } = AnnouncementPriority.Normal;

    /// <summary>
    /// ID of the user who created the announcement
    /// </summary>
    public string AuthorId { get; set; } = string.Empty;

    /// <summary>
    /// Name of the author (denormalized for performance)
    /// </summary>
    public string AuthorName { get; set; } = string.Empty;

    /// <summary>
    /// Whether the announcement is published and visible
    /// </summary>
    public bool IsPublished { get; set; } = true;

    /// <summary>
    /// Date when the announcement should be published (if scheduled)
    /// </summary>
    public DateTime? PublishDate { get; set; }

    /// <summary>
    /// Date when the announcement should expire (if applicable)
    /// </summary>
    public DateTime? ExpiryDate { get; set; }

    /// <summary>
    /// Target audience for the announcement
    /// </summary>
    public string? TargetAudience { get; set; }

    /// <summary>
    /// Whether the announcement is pinned to the top
    /// </summary>
    public bool IsPinned { get; set; } = false;

    /// <summary>
    /// Number of views the announcement has received
    /// </summary>
    public int ViewCount { get; set; } = 0;

    /// <summary>
    /// Collection of attachments associated with the announcement
    /// </summary>
    public virtual ICollection<AnnouncementAttachment> Attachments { get; set; } = new List<AnnouncementAttachment>();
}

/// <summary>
/// Enumeration of announcement categories
/// </summary>
public enum AnnouncementCategory
{
    General = 1,
    Academic = 2,
    Administrative = 3,
    Events = 4,
    Emergency = 5,
    Maintenance = 6,
    Policy = 7
}

/// <summary>
/// Enumeration of announcement priorities
/// </summary>
public enum AnnouncementPriority
{
    Low = 1,
    Normal = 2,
    High = 3,
    Critical = 4
}

/// <summary>
/// Attachment entity for announcements
/// </summary>
public class AnnouncementAttachment : BaseEntity
{
    /// <summary>
    /// ID of the associated announcement
    /// </summary>
    public Guid AnnouncementId { get; set; }

    /// <summary>
    /// Navigation property to the announcement
    /// </summary>
    public virtual Announcement Announcement { get; set; } = null!;

    /// <summary>
    /// Original filename of the attachment
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// URL or path to the stored file
    /// </summary>
    public string FileUrl { get; set; } = string.Empty;

    /// <summary>
    /// MIME type of the file
    /// </summary>
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// Size of the file in bytes
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// Description of the attachment
    /// </summary>
    public string? Description { get; set; }
}
