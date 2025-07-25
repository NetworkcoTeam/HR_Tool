namespace HR_Tool.Api.Models
{
    public class AdmitUserResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string UserIdNumber { get; set; }
        public long? EmployeeId { get; set; }
        public int? ContractId { get; set; }
        public string UserNewStatus { get; set; }
    }
}