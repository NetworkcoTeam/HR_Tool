using Microsoft.AspNetCore.Mvc;
using Supabase;
using HR_Tool.Api.Models;
using BCrypt.Net;

[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
    private readonly Client _supabase;

    public LoginController()
    {
        var url = Environment.GetEnvironmentVariable("SUPABASE_URL");
        var key = Environment.GetEnvironmentVariable("SUPABASE_KEY");

        if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(key))
        {
            throw new Exception("Supabase environment variables (SUPABASE_URL or SUPABASE_KEY) are not set.");
        }

        _supabase = new Client(url, key);
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and Password are required." });
        }

        await _supabase.InitializeAsync();

        var response = await _supabase.From<User>()
            .Where(u => u.Email == request.Email)
            .Get();

        var user = response.Models.FirstOrDefault();

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var valid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);

        if (!valid)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        return Ok(new 
        { 
            name = user.Name,
            surname = user.Surname,
            email = user.Email,
            role = user.Role,
            idNumber = user.IdNumber,
            employee_id = user.EmployeeId            
        });
    }
}
