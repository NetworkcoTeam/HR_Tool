// LeaveRequestDto.cs
namespace HR_Tool.Api.Models
{
    public class LeaveRequestDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string EmployeeId { get; set; }
        public string Position { get; set; }
        public string Department { get; set; }
        public DateTime LeaveStart { get; set; }
        public DateTime LeaveEnd { get; set; }
        public int TotalDays { get; set; }
        public string TypeOfLeave { get; set; }
        public string Status { get; set; } = "Pending"; // Default value
        public string OtherDetails { get; set; }
        public string DoctorsLetter { get; set; }
        public string FuneralLetter { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}