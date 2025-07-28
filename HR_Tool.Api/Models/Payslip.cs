
using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace HR_Tool.Api.Models
{
    [Table("pay_slips")]
    public class Payslip : BaseModel
    {
        
        [PrimaryKey("pay_slip_id")]
        public int PaySlipId { get; set; }

        [Column("employee_id")]
        public long EmployeeId { get; set; }  

        [Column("period_start")]
        public DateTime PeriodStart { get; set; }  

        [Column("period_end")]
        public DateTime PeriodEnd { get; set; }  
        [Column("basic_salary")]
        public decimal BasicSalary { get; set; }  

        [Column("generated_at")]
        public DateTime? GeneratedAt { get; set; }

        [Column("tax_amount")]
        public decimal? TaxAmount { get; set; }  

        [Column("uif")]  
        public decimal? UIF { get; set; }  
 
        
        [Column("net_salary")]
        public decimal? NetSalary { get; set; }
          
    }

}

