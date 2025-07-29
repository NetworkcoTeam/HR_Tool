using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace HR_Tool.Api.Models
{
    [Table("leave_requests")]
    public class LeaveRequest : BaseModel
    {

        [PrimaryKey("id")]
        [Column("id")]
        public Guid Id { get; set; } = Guid.NewGuid();
        
        [Column("name")]
        public string Name { get; set; }

        [Column("surname")]
        public string Surname { get; set; }

        [Column("employee_id")]
        public string EmployeeId { get; set; }

        [Column("position")]
        public string Position { get; set; }

        [Column("department")]
        public string Department { get; set; }

        [Column("leave_start")]
        public DateTime LeaveStart { get; set; }

        [Column("leave_end")]
        public DateTime LeaveEnd { get; set; }

        [Column("total_days")]
        public int TotalDays { get; set; }

        [Column("type_of_leave")]
        public string TypeOfLeave { get; set; }

        [Column("other_details")]
        public string? OtherDetails { get; set; }

        [Column("doctors_letter")]
        public string? DoctorsLetter { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Pending"; 
     
        [Column("funeral_letter")]
        public string? FuneralLetter { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}