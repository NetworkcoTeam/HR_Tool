public class LeaveRequestDto
{
    public Guid Id { get; set; }
    public string EmployeeId { get; set; }
    public string Name { get; set; }
    public string Surname { get; set; }
    public string Position { get; set; }
    public string Department { get; set; }
    public string TypeOfLeave { get; set; }
    public string Status { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    // Add any other properties you need exposed to clients
}
