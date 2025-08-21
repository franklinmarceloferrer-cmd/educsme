using AutoMapper;
using EduCMS.Api.Models;
using EduCMS.Core.Entities;
using EduCMS.Core.Interfaces;

namespace EduCMS.Api.Mappings;

/// <summary>
/// AutoMapper profile for mapping between entities and DTOs
/// </summary>
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Student mappings
        CreateMap<Student, StudentDto>();
        
        CreateMap<CreateStudentDto, Student>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
            .ForMember(dest => dest.AvatarUrl, opt => opt.Ignore());

        CreateMap<UpdateStudentDto, Student>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
            .ForMember(dest => dest.DeletedAt, opt => opt.Ignore())
            .ForMember(dest => dest.EnrollmentDate, opt => opt.Ignore())
            .ForMember(dest => dest.AvatarUrl, opt => opt.Ignore());

        // Student statistics mapping
        CreateMap<StudentStatistics, StudentStatisticsDto>()
            .ForMember(dest => dest.StudentsByStatus, opt => opt.MapFrom(src => 
                src.StudentsByStatus.ToDictionary(kvp => kvp.Key.ToString(), kvp => kvp.Value)));

        // Announcement mappings (to be implemented)
        // CreateMap<Announcement, AnnouncementDto>();
        // CreateMap<CreateAnnouncementDto, Announcement>();
        // CreateMap<UpdateAnnouncementDto, Announcement>();

        // Document mappings (to be implemented)
        // CreateMap<Document, DocumentDto>();
        // CreateMap<CreateDocumentDto, Document>();
        // CreateMap<UpdateDocumentDto, Document>();
    }
}
