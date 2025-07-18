using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Supabase;
using HR_Tool.Api.Models;
using System;
using System.Threading.Tasks;
using System.Linq;

[ApiController]
[Route("api/[controller]")]
public class LeaveRequestController : ControllerBase
{
    private readonly string _url = "https://mdgmlbenfmvnfoamvwkr.supabase.co";
    private readonly string _key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZ21sYmVuZm12bmZvYW12d2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NjE5NDQsImV4cCI6MjA2NzUzNzk0NH0.92S3AWVWvVkdbJGqsuzFJW9j6nXHFOK43IvfXbkEFrE";

    private readonly ILogger<LeaveRequestController> _logger;

    public LeaveRequestController(ILogger<LeaveRequestController> logger)
    {
        _logger = logger;
    }

    // -------------------------------
    // Existing POST stays the same
    // -------------------------------

    // ✅ GET: All leave requests for HR
    /*[HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var supabase = new Client(_url, _key);
        await supabase.InitializeAsync();

        var response = await supabase.From<LeaveRequest>().Get();
        return Ok(response.Models);
    }

    // ✅ GET: All leave requests for specific user
    [HttpGet("{employeeId}")]
    public async Task<IActionResult> GetByEmployeeId(string employeeId)
    {
        var supabase = new Client(_url, _key);
        await supabase.InitializeAsync();

        var response = await supabase
            .From<LeaveRequest>()
            .Filter("employee_id", Supabase.Postgrest.Constants.Operator.Equals, employeeId)
            .Get();

        return Ok(response.Models);
    }*/
[HttpGet]
public async Task<IActionResult> GetAll()
{
    var supabase = new Client(_url, _key);
    await supabase.InitializeAsync();

    var response = await supabase.From<LeaveRequest>().Get();

    var dtos = response.Models.Select(lr => new LeaveRequestDto
    {
        Id = lr.Id,
        EmployeeId = lr.EmployeeId,
        Name = lr.Name,
        Surname = lr.Surname,
        Position = lr.Position,
        Department = lr.Department,
        TypeOfLeave = lr.TypeOfLeave,
        Status = lr.Status,
        StartDate = lr.LeaveStart,
        EndDate = lr.LeaveEnd
        // map other properties as needed
    });

    return Ok(dtos);
}


    // ✅ PUT: Update leave status (Approved or Denied)
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string newStatus)
    {
        if (string.IsNullOrWhiteSpace(newStatus) || 
            !(newStatus.Equals("Approved", StringComparison.OrdinalIgnoreCase) ||
              newStatus.Equals("Denied", StringComparison.OrdinalIgnoreCase)))
        {
            return BadRequest(new { message = "Status must be Approved or Denied." });
        }

        var supabase = new Client(_url, _key);
        await supabase.InitializeAsync();

        // Fetch existing record
        var response = await supabase
            .From<LeaveRequest>()
            .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, id.ToString())
            .Get();

        var leaveRequest = response.Models.FirstOrDefault();
        if (leaveRequest == null)
        {
            return NotFound(new { message = "Leave request not found." });
        }

        leaveRequest.Status = newStatus;

        await supabase.From<LeaveRequest>().Update(leaveRequest);

        return Ok(new { message = $"Leave request status updated to {newStatus}." });
    }

    // ✅ DELETE: User deletes their own leave request
    /*[HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var supabase = new Client(_url, _key);
        await supabase.InitializeAsync();

        var response = await supabase
            .From<LeaveRequest>()
            .Filter("id", Supabase.Postgrest.Constants.Operator.Equals, id)
            .Delete();

        if (response.ResponseMessage.IsSuccessStatusCode)
        {
            return Ok(new { message = "Leave request deleted successfully." });
        }

        return StatusCode(500, new { message = "Could not delete leave request." });
    }*/
}
