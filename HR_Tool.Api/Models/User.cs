using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;
using System;

namespace HR_Tool.Api.Models
{
    [Table("users")]
    public class User : BaseModel
    {
        [Column("name")]
        public string Name { get; set; }

        [Column("surname")]
        public string Surname { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("role")]
        public string Role { get; set; }

        [Column("idnumber")]
        public string IdNumber { get; set; }

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("password_hash")]
        public string PasswordHash { get; set; }

        [Column("user_status")]
        public string Status { get; set; } = "Pending";

        [PrimaryKey("employee_id")]
        public long? EmployeeId { get; set; }

        // new fields for password reset functionality
        [Column("reset_token")]
        public string ResetToken { get; set; }

        [Column("reset_token_expiry")]
        public DateTime? ResetTokenExpiry { get; set; }

        [Column("last_password_reset")]
        public DateTime? LastPasswordReset { get; set; }
    }
}