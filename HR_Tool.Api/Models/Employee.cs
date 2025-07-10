using Supabase.Postgrest.Models;
namespace HR_Tool.Api.Models;

public class Employee : BaseModel
{
    public int EmployeeId { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public DateOnly? DateOfBirth { get; set; }
    public DateOnly? HireDate { get; set; }
    public string? Position { get; set; }
    public string? Department { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<PaySlip> PaySlips { get; set; } = new List<PaySlip>();
    public ICollection<LeaveRequest> LeaveRequests { get; set; } = new List<LeaveRequest>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<Contract> Contracts { get; set; } = new List<Contract>();
}
