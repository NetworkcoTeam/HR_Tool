namespace HR_Tool.Api.Models
{
    public class TodoDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Status { get; set; }
        public DateTime? DueDate { get; set; }
        public string Priority { get; set; }
        public long EmployeeId { get; set; } // THIS WAS MISSING
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}