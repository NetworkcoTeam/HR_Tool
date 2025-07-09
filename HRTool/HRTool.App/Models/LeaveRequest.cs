   namespace HRTool.API.HRTool
   {
    public class LeaveRequest
    {
        public string LEAVE_REQ_ID { get; set; } = string.Empty; 

        public string EMP_ID { get; set; } = string.Empty; 
        public string LEAVE_TYPE { get; set; } = string.Empty; 
        public DateTime START_DATE { get; set; } 
        public DateTime END_DATE { get; set; } 
        public string L_STATUS { get; set; } = string.Empty; 
        public string REASON { get; set; } = string.Empty; 
        public string? APPROVER_ID { get; set; } 

        public Employee? Employee { get; set; }
        public User? Approver { get; set; } 
    }
   }