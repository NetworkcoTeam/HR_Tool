using Supabase.Postgrest.Models;
using Supabase.Postgrest.Attributes;

namespace HR_Tool.Api.Models
{
    [Table("documents")]
    public class Document : BaseModel
    {
        [PrimaryKey("doc_id")]
        public long DocId { get; set; }

        [Column("employee_id")]
        public long EmployeeId { get; set; }

        [Column("doc_name")]
        public string DocName { get; set; } = null!;

        [Column("doc_type")]
        public string DocType { get; set; } = null!;

        [Column("last_name")]
        public string LastName { get; set; } = null!;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Column("file_size")]  
    public long FileSize { get; set; }

    }
}