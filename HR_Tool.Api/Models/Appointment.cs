using System;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace HR_Tool.Api.Models
{
   
    [Table("appointments")]
    public class Appointment : BaseModel
    {
        [PrimaryKey("appointment_id", false)]
        public int AppointmentId { get; set; }

        [Column("employee_id")]
        public long EmployeeId { get; set; }

        [Column("subject")]
        public string Subject { get; set; } = string.Empty;

        [Column("description")]
        public string Description { get; set; } = string.Empty;

        [Column("appointment_date")]
        public DateTime AppointmentDate { get; set; }

        [Column("start_time")]
        public TimeSpan StartTime { get; set; }

        [Column("end_time")]
        public TimeSpan EndTime { get; set; }

        [Column("contact_number")]
        public string? ContactNumber { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Pending";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}