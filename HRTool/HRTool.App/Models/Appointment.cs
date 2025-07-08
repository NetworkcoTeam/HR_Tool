   namespace HRTool.App.Models
   {
    public class Appointment
    {
        public string APPNTMNT_ID { get; set; } = string.Empty; 

        public string EMP_ID { get; set; } = string.Empty;
        public string HR_STUFF_ID { get; set; } = string.Empty; 
        public DateTime APPNTMNT_DATE { get; set; } 
        public TimeSpan START_TIME { get; set; } 
        public TimeSpan END_TIME { get; set; } 
        public string SUBJECT { get; set; } = string.Empty; 
        public string A_STATUS { get; set; } = string.Empty; 
        public DateTime CREATED_AT { get; set; } = DateTime.UtcNow; 
        public DateTime UPDATED_AT { get; set; } = DateTime.UtcNow; 

        public Employee? Employee { get; set; } 
        public User? HRStaff { get; set; } 
    }
   }