using Microsoft.AspNetCore.Mvc;
using Supabase;
using HR_Tool.Api.Models;
using BCrypt.Net;

[ApiController]
[Route("api/[controller]")]
public class LoginController : ControllerBase
{
    private readonly string _url = "https://mdgmlbenfmvnfoamvwkr.supabase.co";
    private readonly string _key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZ21sYmVuZm12bmZvYW12d2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NjE5NDQsImV4cCI6MjA2NzUzNzk0NH0.92S3AWVWvVkdbJGqsuzFJW9j6nXHFOK43IvfXbkEFrE";

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

        var supabase = new Client(_url, _key);
        await supabase.InitializeAsync();

        var response = await supabase.From<User>()
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
            idNumber = user.IdNumber            
        });
    }
}
