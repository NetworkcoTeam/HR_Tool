using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Supabase;
using HR_Tool.Api.Models; // Assuming Employee and EmployeeDto are here
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq; // Required for .Select and .ToList

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly Client _supabase; 
    private readonly ILogger<EmployeesController> _logger;

    public EmployeesController(ILogger<EmployeesController> logger)
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

    [HttpGet]
    public async Task<IActionResult> GetAllEmployees()
    {
        try
        {

            var response = await _supabase.From<Employee>()
                .Select("employee_id, user_id, first_name, last_name, position, department")
                .Get();

            var employees = response.Models?.Select(e => new EmployeeDto
            {
                EmployeeId = e.EmployeeId,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Position = e.Position ?? "Not specified",
                Department = e.Department ?? "Not specified"
            }).ToList() ?? new List<EmployeeDto>();

            return Ok(employees);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching employees");
            return StatusCode(500, new { 
                message = "Error fetching employees",
                details = ex.Message 
            });
        }
    }
}