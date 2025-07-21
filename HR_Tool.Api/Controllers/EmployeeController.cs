using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Supabase;
using HR_Tool.Api.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly string _url = "https://mdgmlbenfmvnfoamvwkr.supabase.co";
    private readonly string _key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZ21sYmVuZm12bmZvYW12d2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NjE5NDQsImV4cCI6MjA2NzUzNzk0NH0.92S3AWVWvVkdbJGqsuzFJW9j6nXHFOK43IvfXbkEFrE";

    private readonly ILogger<EmployeesController> _logger;

    public EmployeesController(ILogger<EmployeesController> logger)
    {
        _logger = logger;
    }

[HttpGet]
public async Task<IActionResult> GetAllEmployees()
{
    try
    {
        var supabase = new Client(_url, _key);
        await supabase.InitializeAsync();

        var response = await supabase.From<Employee>()
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