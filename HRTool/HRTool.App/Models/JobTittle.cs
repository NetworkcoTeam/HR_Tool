   namespace HRTool.App.Models
   {
    public class JobTitle
    {
        public string JOB_ID { get; set; } = string.Empty; 
        public string NAME { get; set; } = string.Empty; 

        public ICollection<Employee>? Employees { get; set; }
    }
   }