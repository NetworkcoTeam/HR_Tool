namespace HR_Tool.Api.Models;

public class LeaveRequest
{
    public int LeaveId { get; set; }

    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public string? Reason { get; set; }
    public string Status { get; set; } = "pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int? ApprovedBy { get; set; }
    public User? Approver { get; set; }
}
