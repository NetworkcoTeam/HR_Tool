using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;
using System;

namespace HR_Tool.Api.Models
{
    [Table("todos")]
    public class Todo : BaseModel
    {
        [PrimaryKey("id")]
        public int Id { get; set; }

        [Column("employee_id")]
        public long EmployeeId { get; set; }

        [Column("title")]
        public string Title { get; set; }

        [Column("status")]
        public string Status { get; set; }

        [Column("due_date")]
        public DateTime? DueDate { get; set; }

        [Column("priority")]
        public string Priority { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }
}
