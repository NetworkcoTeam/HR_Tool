namespace HR_Tool.Api.Models;

public class Appointment
{
    public int AppointmentId { get; set; }

    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public string Subject { get; set; } = null!;
    public string? Description { get; set; }
    public DateTime AppointmentDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
