using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Supabase;
using HR_Tool.Api.Models; 
using System;
using System.Threading.Tasks;
using System.Linq; 
using System.Collections.Generic; 

[ApiController]
[Route("api/[controller]")]
public class LeaveRequestController : ControllerBase
{
    private readonly Client _supabase;
    private readonly ILogger<LeaveRequestController> _logger;

    public LeaveRequestController(ILogger<LeaveRequestController> logger)
    {
        _logger = logger;

        var url = Environment.GetEnvironmentVariable("SUPABASE_URL");
        var key = Environment.GetEnvironmentVariable("SUPABASE_KEY");

        if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(key))
        {
            throw new Exception("Supabase environment variables (SUPABASE_URL or SUPABASE_KEY) are not set.");
        }

        
        _supabase = new Client(url, key);
    }

    [HttpPost]
    public async Task<IActionResult> Leave([FromBody] LeaveRequestDto request)
    {
        try
        {
            _logger.LogInformation("Received leave request: {@Request}", request);

            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Surname) ||
                string.IsNullOrWhiteSpace(request.EmployeeId) ||
                string.IsNullOrWhiteSpace(request.Position) ||
                string.IsNullOrWhiteSpace(request.Department) ||
                request.LeaveStart == default ||
                request.LeaveEnd == default ||
                string.IsNullOrWhiteSpace(request.TypeOfLeave))
            {
                _logger.LogWarning("Validation failed for leave request: {@Request}", request);
                return BadRequest(new { message = "Missing required fields." });
            }

            if (request.LeaveEnd < request.LeaveStart)
            {
                _logger.LogWarning("Invalid leave dates: LeaveEnd ({LeaveEnd}) is before LeaveStart ({LeaveStart})",
                    request.LeaveEnd, request.LeaveStart);
                return BadRequest(new { message = "Leave end date cannot be before start date." });
            }

            // Initialize Supabase client if not already initialized (though it's in constructor now)
            // await _supabase.InitializeAsync(); // This line is not strictly needed here if initialized in constructor

            var leaveRequest = new LeaveRequest 
            {
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
                CreatedAt = DateTime.UtcNow 
            };

            var response = await _supabase.From<LeaveRequest>().Insert(leaveRequest);

            if (response.Models == null || response.Models.Count == 0)
            {
                _logger.LogError("Supabase insert returned empty result. Status: {StatusCode}, Error: {Error}",
                    response.ResponseMessage?.StatusCode,
                    await response.ResponseMessage?.Content.ReadAsStringAsync());

                return StatusCode(500, new { message = "Could not submit leave request." });
            }

            _logger.LogInformation("Leave request inserted successfully: {@Inserted}", response.Models[0]);
            return Ok(new { message = "Leave request submitted successfully!" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while submitting leave request.");
            return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
        }
    }

    // New endpoint from main: Get All Leave Requests
    [HttpGet("all")]
    public async Task<IActionResult> GetAllLeaveRequests()
    {
        try
        {
            // await _supabase.InitializeAsync(); // Not strictly needed here if initialized in constructor

            var response = await _supabase.From<LeaveRequest>()
                .Select("*") // Select all columns
                .Get();

            var dtos = response.Models?.Select(r => new LeaveRequestDto // Map to LeaveRequestDto
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
            }).ToList() ?? new List<LeaveRequestDto>(); // Ensure it's a list

            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching leave requests");
            return StatusCode(500, new { message = "Error fetching leave requests" });
        }
    }

    // New endpoint from main: Update Leave Request Status
    [HttpPut("status/{id}")]
    public async Task<IActionResult> UpdateLeaveRequestStatus(Guid id, [FromBody] UpdateStatusDto statusDto) // Using new UpdateStatusDto
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

            // await _supabase.InitializeAsync(); // Not strictly needed here if initialized in constructor

            var result = await _supabase.From<LeaveRequest>()
                .Where(x => x.Id == id) // Filter by ID
                .Set(x => x.Status, statusDto.Status) // Set the new status
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
}