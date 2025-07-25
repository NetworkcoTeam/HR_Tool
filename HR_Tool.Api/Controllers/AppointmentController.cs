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
public class AppointmentController : ControllerBase
{
    private readonly Client _supabase;
    private readonly ILogger<AppointmentController> _logger;

    public AppointmentController(ILogger<AppointmentController> logger)
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
    public async Task<IActionResult> BookAppointment([FromBody] AppointmentDto request)
    {
        try
        {
            _logger.LogInformation("Received appointment booking request: {@Request}", request);

            // Validation
            if (request.EmployeeId <= 0 ||
                string.IsNullOrWhiteSpace(request.Subject) ||
                string.IsNullOrWhiteSpace(request.Description) ||
                request.AppointmentDate == default ||
                request.StartTime == default ||
                request.EndTime == default)
            {
                _logger.LogWarning("Validation failed for appointment request: {@Request}", request);
                return BadRequest(new { message = "Missing required fields." });
            }

            // Validate appointment date is not in the past
            if (request.AppointmentDate.Date < DateTime.Today)
            {
                _logger.LogWarning("Invalid appointment date: AppointmentDate ({AppointmentDate}) is in the past",
                    request.AppointmentDate);
                return BadRequest(new { message = "Appointment date cannot be in the past." });
            }

            // Validate start time is before end time
            if (request.EndTime <= request.StartTime)
            {
                _logger.LogWarning("Invalid appointment times: EndTime ({EndTime}) is not after StartTime ({StartTime})",
                    request.EndTime, request.StartTime);
                return BadRequest(new { message = "End time must be after start time." });
            }

            var appointment = new Appointment
            {
                EmployeeId = request.EmployeeId,
                Subject = request.Subject,
                Description = request.Description,
                AppointmentDate = request.AppointmentDate,
                StartTime = request.StartTime,
                EndTime = request.EndTime,
                ContactNumber = request.ContactNumber,
                Status = "Pending", // Default status
                CreatedAt = DateTime.UtcNow
            };

            var response = await _supabase.From<Appointment>().Insert(appointment);

            if (response.Models == null || response.Models.Count == 0)
            {
                _logger.LogError("Supabase insert returned empty result. Status: {StatusCode}, Error: {Error}",
                    response.ResponseMessage?.StatusCode,
                    await response.ResponseMessage?.Content.ReadAsStringAsync());

                return StatusCode(500, new { message = "Could not book appointment." });
            }

            _logger.LogInformation("Appointment booked successfully: {@Inserted}", response.Models[0]);
            return Ok(new { message = "Appointment booked successfully!" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while booking appointment.");
            return StatusCode(500, new { message = "An unexpected error occurred.", details = ex.Message });
        }
    }

    [HttpGet("all")]
public async Task<IActionResult> GetAllAppointments()
{
    try
    {
        var response = await _supabase.From<Appointment>()
            .Select("*")
            .Get();

        return Ok(response.Models);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error fetching all appointments");
        return StatusCode(500, new { message = "Internal server error" });
    }
}

    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetAppointmentsByEmployee(int employeeId)
    {
        try
        {
            var response = await _supabase.From<Appointment>()
                .Select("*")
                .Where(x => x.EmployeeId == employeeId)
                .Order("appointment_date", Supabase.Postgrest.Constants.Ordering.Ascending)
                .Get();

            var dtos = response.Models?.Select(a => new AppointmentDto
            {
                AppointmentId = a.AppointmentId,
                EmployeeId = a.EmployeeId,
                Subject = a.Subject,
                Description = a.Description,
                AppointmentDate = a.AppointmentDate,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                ContactNumber = a.ContactNumber,
                Status = a.Status,
                CreatedAt = a.CreatedAt
            }).ToList() ?? new List<AppointmentDto>();

            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching appointments for employee {EmployeeId}", employeeId);
            return StatusCode(500, new { message = "Error fetching employee appointments" });
        }
    }

    // Update appointment status (for HR Admin)
    [HttpPut("status/{appointmentId}")]
    public async Task<IActionResult> UpdateAppointmentStatus(int appointmentId, [FromBody] UpdateAppointmentStatusDto statusDto)
    {
        try
        {
            if (statusDto == null || string.IsNullOrWhiteSpace(statusDto.Status))
            {
                return BadRequest(new { message = "Status is required" });
            }

            var validStatuses = new[] { "Pending", "Accepted", "Rejected", "Cancelled" };
            if (!validStatuses.Contains(statusDto.Status))
            {
                return BadRequest(new { message = "Invalid status value. Valid statuses: Pending, Accepted, Rejected, Cancelled" });
            }

            var result = await _supabase.From<Appointment>()
                .Where(x => x.AppointmentId == appointmentId)
                .Set(x => x.Status, statusDto.Status)
                .Update();

            if (result.Models?.Count > 0)
            {
                _logger.LogInformation("Appointment status updated successfully: AppointmentId={AppointmentId}, Status={Status}", 
                    appointmentId, statusDto.Status);
                return Ok(new { message = "Appointment status updated successfully" });
            }

            return NotFound(new { message = "Appointment not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating appointment status for AppointmentId={AppointmentId}", appointmentId);
            return StatusCode(500, new { message = "Error updating appointment status" });
        }
    }

    // Cancel appointment (for Employee)
    [HttpPut("cancel/{appointmentId}")]
    public async Task<IActionResult> CancelAppointment(int appointmentId, [FromBody] CancelAppointmentDto cancelDto)
    {
        try
        {
            // Optional: Add employee ID validation to ensure employees can only cancel their own appointments
            if (cancelDto?.EmployeeId > 0)
            {
                // First check if the appointment belongs to the employee
                var checkResponse = await _supabase.From<Appointment>()
                    .Select("employee_id")
                    .Where(x => x.AppointmentId == appointmentId)
                    .Single();

                if (checkResponse == null || checkResponse.EmployeeId != cancelDto.EmployeeId)
                {
                    return Forbid("You can only cancel your own appointments");
                }
            }

            var result = await _supabase.From<Appointment>()
                .Where(x => x.AppointmentId == appointmentId)
                .Set(x => x.Status, "Cancelled")
                .Update();

            if (result.Models?.Count > 0)
            {
                _logger.LogInformation("Appointment cancelled successfully: AppointmentId={AppointmentId}", appointmentId);
                return Ok(new { message = "Appointment cancelled successfully" });
            }

            return NotFound(new { message = "Appointment not found" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling appointment AppointmentId={AppointmentId}", appointmentId);
            return StatusCode(500, new { message = "Error cancelling appointment" });
        }
    }

    // Get upcoming appointments (next 7 days)
    [HttpGet("upcoming")]
    public async Task<IActionResult> GetUpcomingAppointments()
    {
        try
        {
            var today = DateTime.Today;
            var nextWeek = today.AddDays(7);

            var response = await _supabase.From<Appointment>()
                .Select("*")
                .Where(x => x.AppointmentDate >= today && x.AppointmentDate <= nextWeek)
                .Where(x => x.Status != "Cancelled" && x.Status != "Rejected")
                .Order("appointment_date", Supabase.Postgrest.Constants.Ordering.Ascending)
                .Order("start_time", Supabase.Postgrest.Constants.Ordering.Ascending)
                .Get();

            var dtos = response.Models?.Select(a => new AppointmentDto
            {
                AppointmentId = a.AppointmentId,
                EmployeeId = a.EmployeeId,
                Subject = a.Subject,
                Description = a.Description,
                AppointmentDate = a.AppointmentDate,
                StartTime = a.StartTime,
                EndTime = a.EndTime,
                ContactNumber = a.ContactNumber,
                Status = a.Status,
                CreatedAt = a.CreatedAt
            }).ToList() ?? new List<AppointmentDto>();

            return Ok(dtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching upcoming appointments");
            return StatusCode(500, new { message = "Error fetching upcoming appointments" });
        }
    }
}