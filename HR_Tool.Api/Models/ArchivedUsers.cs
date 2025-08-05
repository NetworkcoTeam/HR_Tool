using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;
using System;

namespace HR_Tool.Api.Models
{
    [Table("archived_users")]
    public class archived_users : BaseModel
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
        public string Status { get; set; } = "Offboarded"; // Default status for archived users

        [PrimaryKey("employee_id")]
        public long? EmployeeId { get; set; }

        [Column("reset_token")]
        public string ResetToken { get; set; }

        [Column("reset_token_expiry")]
        public DateTime? ResetTokenExpiry { get; set; }

        [Column("last_password_reset")]
        public DateTime? LastPasswordReset { get; set; }

        [Column("archived_at")]
        public DateTime ArchivedAt { get; set; } = DateTime.UtcNow;
    }
}