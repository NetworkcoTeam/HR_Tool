using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

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

    }
}

