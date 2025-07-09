   namespace HRTool.App.Models
   {
    public class Employee
    {
        public string EMP_ID { get; set; } = string.Empty; 

        public int User_ID { get; set; } 
        public string DEP_ID { get; set; } = string.Empty; 
        public string JOB_ID { get; set; } = string.Empty; 
        public DateTime HIRE_DATE { get; set; } 
        public DateTime? TERMI_DATE { get; set; } 
        public string E_STATUS { get; set; } = string.Empty; 

        // Navigation properties
        public User? User { get; set; }
        public Department? Department { get; set; }
        public JobTitle? JobTitle { get; set; }
        public ICollection<LeaveRequest>? LeaveRequests { get; set; }
        public ICollection<Appointment>? Appointments { get; set; }
        public ICollection<Document>? Documents { get; set; }
    }
   }
        
        
        
