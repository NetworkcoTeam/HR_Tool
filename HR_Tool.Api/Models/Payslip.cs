namespace HR_Tool.Api.Models;

public class PaySlip
{
    public int PaySlipId { get; set; }

    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public DateOnly PeriodStart { get; set; }
    public DateOnly PeriodEnd { get; set; }
    public decimal Amount { get; set; }
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}

