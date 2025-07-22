using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace HR_Tool.Api.Models
{
    [Table("contracts")]
    public class Contract : BaseModel
    {
    [PrimaryKey("contract_id")]
    public int ContractId { get; set; }

    [Column("employee_id")]
    public long EmployeeId { get; set; }  

    [Column("contract_type")]
    public string? ContractType { get; set; }

    [Column("start_date")]
    public DateTime StartDate { get; set; }

    [Column("end_date")]
    public DateTime? EndDate { get; set; }

    [Column("basic_salary")]
    public decimal BasicSalary { get; set; }  

    [Column("terms")]
    public string? Terms { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    }
}