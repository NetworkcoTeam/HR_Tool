namespace HRTool.App.Models
{
     public class User
    {
        public int User_ID { get; set; } 

        public string Username { get; set; } = string.Empty;
        public string User_Password { get; set; } = string.Empty; 
        public string User_Email { get; set; } = string.Empty;
        public string User_Fname { get; set; } = string.Empty; 
        public string User_Lname { get; set; } = string.Empty; 
        public string User_Role { get; set; } = "employee"; 
        public bool User_Acc_Status { get; set; } = true; 
        public DateTime User_Reg_Date { get; set; } = DateTime.UtcNow; 

        // Navigation properties (for EF Core relationships)
        //Its primary purpose is to allow working with database data using .NET objects (i.e.models) without writing raw SQL queries.
        public ICollection<Employee>? Employees { get; set; } 
        public ICollection<LeaveRequest>? ApprovedLeaveRequests { get; set; } 
        public ICollection<Appointment>? HRStaffAppointments { get; set; } 
        public ICollection<Document>? UploadedDocuments { get; set; } 
    }
}