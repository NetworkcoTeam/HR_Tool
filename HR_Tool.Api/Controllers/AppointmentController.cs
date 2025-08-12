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
            //_logger.LogInformation("Received appointment booking request: {@Request}", request);

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

            // Check for conflicting appointments with 15-minute buffer
            var conflictCheck = await CheckForTimeConflicts(request.AppointmentDate.Date, request.StartTime, request.EndTime);
            if (!conflictCheck.IsAvailable)
            {
                _logger.LogWarning("Time conflict detected for appointment request: {@Request}", request);
                return BadRequest(new { 
                    message = "Time slot not available. Please choose a different time.", 
                    details = conflictCheck.ConflictMessage,
                    conflictingAppointments = conflictCheck.ConflictingAppointments 
                });
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

    private async Task<ConflictCheckResult> CheckForTimeConflicts(DateTime appointmentDate, TimeSpan requestedStartTime, TimeSpan requestedEndTime)
    {
        try
        {
            // Create start and end of day for the requested date
            var startOfDay = appointmentDate.Date;
            var endOfDay = appointmentDate.Date.AddDays(1);
            
            // Get all non-cancelled/non-rejected appointments for the same date using date range
            var existingAppointments = await _supabase.From<Appointment>()
                .Select("*")
                .Where(x => x.AppointmentDate >= startOfDay && x.AppointmentDate < endOfDay)
                .Where(x => x.Status != "Cancelled" && x.Status != "Rejected")
                .Get();

            var conflictingAppointments = new List<object>();
            const int bufferMinutes = 15;

            // Add buffer to requested time slot
            var requestedStartWithBuffer = requestedStartTime.Subtract(TimeSpan.FromMinutes(bufferMinutes));
            var requestedEndWithBuffer = requestedEndTime.Add(TimeSpan.FromMinutes(bufferMinutes));

            // Handle negative time (before midnight)
            if (requestedStartWithBuffer.TotalSeconds < 0)
                requestedStartWithBuffer = TimeSpan.Zero;

            // Handle time beyond 24 hours
            if (requestedEndWithBuffer.TotalHours >= 24)
                requestedEndWithBuffer = TimeSpan.FromHours(23).Add(TimeSpan.FromMinutes(59));

            foreach (var appointment in existingAppointments.Models ?? new List<Appointment>())
            {
                var existingStart = appointment.StartTime;
                var existingEnd = appointment.EndTime;

                // Check for overlap considering the buffer
                bool hasConflict = !(requestedEndWithBuffer <= existingStart || requestedStartWithBuffer >= existingEnd);

                if (hasConflict)
                {
                    conflictingAppointments.Add(new ConflictingAppointment
                    {
                        AppointmentId = appointment.AppointmentId,
                        EmployeeId = appointment.EmployeeId,
                        Subject = appointment.Subject,
                        StartTime = FormatTimeSpan(existingStart),
                        EndTime = FormatTimeSpan(existingEnd),
                        Status = appointment.Status
                    });
                }
            }

            if (conflictingAppointments.Any())
            {
                var conflictMessage = $"Appointment conflicts with existing bookings (including 15-minute buffer). " +
                    $"Conflicting times: {string.Join(", ", conflictingAppointments.Select(c => $"{((ConflictingAppointment)c).StartTime}-{((ConflictingAppointment)c).EndTime}"))}";

                return new ConflictCheckResult
                {
                    IsAvailable = false,
                    ConflictMessage = conflictMessage,
                    ConflictingAppointments = conflictingAppointments
                };
            }

            return new ConflictCheckResult { IsAvailable = true };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking for time conflicts");
            // In case of error, allow the booking but log the issue
            return new ConflictCheckResult { IsAvailable = true };
        }
    }

    // Method to get available time slots for a specific date
    [HttpGet("available-slots/{date}")]
    public async Task<IActionResult> GetAvailableSlots(string date)
    {
        try
        {
            if (!DateTime.TryParse(date, out DateTime appointmentDate))
            {
                return BadRequest(new { message = "Invalid date format" });
            }

            // Create start and end of day for the requested date
            var startOfDay = appointmentDate.Date;
            var endOfDay = appointmentDate.Date.AddDays(1);
            
            // Get existing appointments for the date using date range
            var existingAppointments = await _supabase.From<Appointment>()
                .Select("*")
                .Where(x => x.AppointmentDate >= startOfDay && x.AppointmentDate < endOfDay)
                .Where(x => x.Status != "Cancelled" && x.Status != "Rejected")
                .Order("start_time", Supabase.Postgrest.Constants.Ordering.Ascending)
                .Get();

            var occupiedSlots = new List<OccupiedSlot>();
            
            if (existingAppointments.Models != null)
            {
                occupiedSlots = existingAppointments.Models.Select(a => new OccupiedSlot
                {
                    StartTime = FormatTimeSpan(a.StartTime),
                    EndTime = FormatTimeSpan(a.EndTime),
                    Subject = a.Subject
                }).ToList();
                
                _logger.LogInformation("Found {Count} occupied slots for date {Date}: {@Slots}", 
                    occupiedSlots.Count, appointmentDate.ToString("yyyy-MM-dd"), occupiedSlots);
            }

            return Ok(new { 
                date = appointmentDate.ToString("yyyy-MM-dd"),
                occupiedSlots = occupiedSlots,
                note = "Please ensure 15-minute gap between appointments"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching available slots for date {Date}", date);
            return StatusCode(500, new { message = "Error fetching available slots" });
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
            }).ToList();

            return Ok(dtos);
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

    // Helper method to safely format TimeSpan
    private string FormatTimeSpan(TimeSpan timeSpan)
    {
        try
        {
            // Ensure consistent 24-hour format that matches frontend expectations
            return $"{timeSpan.Hours:D2}:{timeSpan.Minutes:D2}";
        }
        catch
        {
            // Fallback if TimeSpan formatting fails
            return "00:00";
        }
    }
}

// Helper class for conflict checking
public class ConflictCheckResult
{
    public bool IsAvailable { get; set; }
    public string ConflictMessage { get; set; } = string.Empty;
    public List<object> ConflictingAppointments { get; set; } = new List<object>();
}

// Helper class for occupied slots
public class OccupiedSlot
{
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
}

// Helper class for conflicting appointments
public class ConflictingAppointment
{
    public int AppointmentId { get; set; }
    public long EmployeeId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string StartTime { get; set; } = string.Empty;
    public string EndTime { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
}