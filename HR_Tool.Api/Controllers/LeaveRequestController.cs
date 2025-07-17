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

    public class LeaveRequestDto
    {
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? EmployeeId { get; set; }
        public string? Position { get; set; }
        public string?Department { get; set; }
        public DateTime LeaveStart { get; set; }
        public DateTime LeaveEnd { get; set; }
        public int TotalDays { get; set; }
        public string? TypeOfLeave { get; set; }
        public string? OtherDetails { get; set; }
        public string? DoctorsLetter { get; set; }
        public string? FuneralLetter { get; set; }
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

        var supabase = new Client(_url, _key);
        await supabase.InitializeAsync();

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

        var response = await supabase.From<LeaveRequest>().Insert(leaveRequest);

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

}
