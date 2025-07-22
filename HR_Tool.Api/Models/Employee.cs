using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace HR_Tool.Api.Models
{
    [Table("employees")]
    public class Employee : BaseModel
    {
        [PrimaryKey("employee_id")]
        public long EmployeeId { get; set; }  

        [Column("user_id")]
        public long? UserId { get; set; }

        [Column("first_name")]
        public string FirstName { get; set; } = null!;

        [Column("last_name")]
        public string LastName { get; set; } = null!;

        [Column("date_of_birth")]
        public DateTime? DateOfBirth { get; set; }

        [Column("hire_date")]
        public DateTime? HireDate { get; set; }

        [Column("position")]
        public string Position { get; set; } = null!;

        [Column("department")]
        public string Department { get; set; } = null!;

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

    }
}