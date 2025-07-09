   namespace HRTool.App.Models
   {
    public class Department
    {
        public string DEP_ID { get; set; } = string.Empty; 
        public string NAME { get; set; } = string.Empty; 

        // Navigation properties
        public ICollection<Employee>? Employees { get; set; }
    }
   }