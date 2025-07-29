using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Supabase;
using HR_Tool.Api.Models;
using System;
using System.Threading.Tasks;

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

    
  [HttpPost]
public async Task<IActionResult> Leave([FromBody] LeaveRequestDto request)
{
    try
    {
        // Log the incoming request
        _logger.LogInformation("Received leave request: {@Request}", request);

        // Validation
        if (string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Surname) ||
            string.IsNullOrWhiteSpace(request.EmployeeId) ||
            string.IsNullOrWhiteSpace(request.Position) ||
            string.IsNullOrWhiteSpace(request.Department) ||
            request.LeaveStart == default ||
            request.LeaveEnd == default ||
            string.IsNullOrWhiteSpace(request.TypeOfLeave))
        {
            return BadRequest(new { message = "Missing required fields." });
        }

        if (request.LeaveEnd < request.LeaveStart)
        {
            return BadRequest(new { message = "Leave end date cannot be before start date." });
        }

        var supabase = new Client(_url, _key);
        await supabase.InitializeAsync();

        var leaveRequest = new LeaveRequest
        {
            // Map from DTO to entity
            Name = request.Name,
            Surname = request.Surname,
            EmployeeId = request.EmployeeId,
            Position = request.Position,
            Department = request.Department,
            LeaveStart = request.LeaveStart,
            LeaveEnd = request.LeaveEnd,
            TotalDays = request.TotalDays,
            TypeOfLeave = request.TypeOfLeave,
            OtherDetails = request.OtherDetails,
            DoctorsLetter = request.DoctorsLetter,
            FuneralLetter = request.FuneralLetter,
            Status = request.Status,
            CreatedAt = request.CreatedAt
        };

        var response = await supabase.From<LeaveRequest>().Insert(leaveRequest);

        if (response.Models == null || response.Models.Count == 0)
        {
            return StatusCode(500, new { message = "Could not submit leave request." });
        }

        return Ok(new { message = "Leave request submitted successfully!" });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error submitting leave request");
        return StatusCode(500, new { message = "An error occurred", error = ex.Message });
    }
}
// LeaveRequestController.cs
[HttpGet("all")]
public async Task<IActionResult> GetAllLeaveRequests()
{
    try
    {
        var supabase = new Client(_url, _key);
        await supabase.InitializeAsync();

        var response = await supabase.From<LeaveRequest>()
            .Select("*")
            .Get();

        var dtos = response.Models?.Select(r => new LeaveRequestDto
        {
            Id = r.Id,
            Name = r.Name,
            Surname = r.Surname,
            EmployeeId = r.EmployeeId,
            Position = r.Position,
            Department = r.Department,
            TypeOfLeave = r.TypeOfLeave,
            LeaveStart = r.LeaveStart,
            LeaveEnd = r.LeaveEnd,
            TotalDays = r.TotalDays,
            Status = r.Status,
            OtherDetails = r.OtherDetails,
            DoctorsLetter = r.DoctorsLetter,
            FuneralLetter = r.FuneralLetter,
            CreatedAt = r.CreatedAt
        }).ToList() ?? new List<LeaveRequestDto>();

        return Ok(dtos);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error fetching leave requests");
        return StatusCode(500, new { message = "Error fetching leave requests" });
    }
}

[HttpPut("status/{id}")]
public async Task<IActionResult> UpdateLeaveRequestStatus(Guid id, [FromBody] UpdateStatusDto statusDto)
{
    try
    {
        if (statusDto == null || string.IsNullOrWhiteSpace(statusDto.Status))
        {
            return BadRequest(new { message = "Status is required" });
        }

        var validStatuses = new[] { "Approved", "Denied", "Pending" };
        if (!validStatuses.Contains(statusDto.Status))
        {
            return BadRequest(new { message = "Invalid status value" });
        }

        var supabase = new Client(_url, _key);
        await supabase.InitializeAsync();

        var result = await supabase.From<LeaveRequest>()
            .Where(x => x.Id == id)
            .Set(x => x.Status, statusDto.Status)
            .Update();

        if (result.Models?.Count > 0)
        {
            return Ok(new { message = "Status updated successfully" });
        }

        return NotFound(new { message = "Leave request not found" });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error updating leave request status");
        return StatusCode(500, new { message = "Error updating status" });
    }
}

[HttpGet("employee/{employeeId}")]
public async Task<IActionResult> GetLeaveRequestsByEmployeeId(string employeeId)
{
    if (string.IsNullOrWhiteSpace(employeeId))
    {
        _logger.LogWarning("Missing employeeId in request.");
        return BadRequest(new { message = "Employee ID is required." });
    }

    try
    {
        var supabase = new Client(_url, _key);
        await supabase.InitializeAsync();

        var response = await supabase
            .From<LeaveRequest>()
            .Where(x => x.EmployeeId == employeeId) 
            .Get();

        _logger.LogInformation("Found {Count} leave requests for employee {EmployeeId}", response.Models?.Count ?? 0, employeeId);

        var dtos = response.Models?.Select(r => new LeaveRequestDto
        {
            Id = r.Id,
            Name = r.Name,
            Surname = r.Surname,
            EmployeeId = r.EmployeeId,
            Position = r.Position,
            Department = r.Department,
            TypeOfLeave = r.TypeOfLeave,
            LeaveStart = r.LeaveStart,
            LeaveEnd = r.LeaveEnd,
            TotalDays = r.TotalDays,
            Status = r.Status,
            OtherDetails = r.OtherDetails,
            DoctorsLetter = r.DoctorsLetter,
            FuneralLetter = r.FuneralLetter,
            CreatedAt = r.CreatedAt
        }).ToList() ?? new List<LeaveRequestDto>();

        return Ok(dtos);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error fetching leave requests for employee {EmployeeId}", employeeId);
        return StatusCode(500, new { message = "Error fetching leave requests" });
    }
}


}