using Supabase.Postgrest.Models;

namespace HR_Tool.Api.Models
{
    public class Employee : BaseModel
    {
        public int Id { get; set; }
        public string FullName { get; set; } = default!;
        public string Position { get; set; } = default!;
    }
}
