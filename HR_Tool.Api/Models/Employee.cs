using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace HR_Tool.Api.Models;

[Table("employees")]
public class Employee : BaseModel
{
    [PrimaryKey("employee_id")]
    [Column("employee_id")]
    public int EmployeeId { get; set; }

    [Column("user_id")]
    public int? UserId { get; set; }

    [Column("first_name")]
    public string FirstName { get; set; } = null!;

    [Column("last_name")]
    public string LastName { get; set; } = null!;

    [Column("date_of_birth")]
    public DateOnly? DateOfBirth { get; set; }

    [Column("hire_date")]
    public DateOnly? HireDate { get; set; }

    [Column("position")]
    public string? Position { get; set; }

    [Column("department")]
    public string? Department { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties (these shouldn't have Column attributes)
    public User User { get; set; } = null!;
    public ICollection<PaySlip> PaySlips { get; set; } = new List<PaySlip>();
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}