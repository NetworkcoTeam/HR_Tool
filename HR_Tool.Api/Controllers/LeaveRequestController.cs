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

    public class LeaveRequestDto
    {
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? EmployeeId { get; set; }
        public string? Position { get; set; }
        public string? Department { get; set; }
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

            await _supabase.InitializeAsync();

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
}