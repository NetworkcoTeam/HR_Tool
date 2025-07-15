namespace HR_Tool.Api.Models;

public class Contract
{
    public int ContractId { get; set; }

    public int EmployeeId { get; set; }
    public Employee Employee { get; set; } = null!;

    public string? ContractType { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string? Terms { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
