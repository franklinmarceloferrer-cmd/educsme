namespace EduCMS.Core.Entities;

/// <summary>
/// Document entity representing files in the document library
/// </summary>
public class Document : BaseEntity
{
    /// <summary>
    /// Name/title of the document
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Description of the document
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Original filename when uploaded
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
    /// Category of the document
    /// </summary>
    public DocumentCategory Category { get; set; } = DocumentCategory.General;

    /// <summary>
    /// Access level for the document
    /// </summary>
    public DocumentAccessLevel AccessLevel { get; set; } = DocumentAccessLevel.Public;

    /// <summary>
    /// ID of the user who uploaded the document
    /// </summary>
    public string UploadedById { get; set; } = string.Empty;

    /// <summary>
    /// Name of the uploader (denormalized for performance)
    /// </summary>
    public string UploadedByName { get; set; } = string.Empty;

    /// <summary>
    /// Number of times the document has been downloaded
    /// </summary>
    public int DownloadCount { get; set; } = 0;

    /// <summary>
    /// Tags associated with the document for better searchability
    /// </summary>
    public string? Tags { get; set; }

    /// <summary>
    /// Version number of the document
    /// </summary>
    public string Version { get; set; } = "1.0";

    /// <summary>
    /// Whether the document is archived
    /// </summary>
    public bool IsArchived { get; set; } = false;

    /// <summary>
    /// Date when the document was archived
    /// </summary>
    public DateTime? ArchivedAt { get; set; }

    /// <summary>
    /// Checksum/hash of the file for integrity verification
    /// </summary>
    public string? FileHash { get; set; }
}

/// <summary>
/// Enumeration of document categories
/// </summary>
public enum DocumentCategory
{
    General = 1,
    Academic = 2,
    Administrative = 3,
    Policy = 4,
    Forms = 5,
    Reports = 6,
    Presentations = 7,
    Images = 8,
    Videos = 9,
    Audio = 10
}

/// <summary>
/// Enumeration of document access levels
/// </summary>
public enum DocumentAccessLevel
{
    Public = 1,
    Internal = 2,
    Restricted = 3,
    Confidential = 4
}
