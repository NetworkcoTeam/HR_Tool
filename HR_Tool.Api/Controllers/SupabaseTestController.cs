using Microsoft.AspNetCore.Mvc;
using Supabase;
using HR_Tool.Api.Models;
using BCrypt.Net;


[ApiController]
[Route("api/[controller]")]
public class RegisterController : ControllerBase
{
    private readonly string _url = "https://mdgmlbenfmvnfoamvwkr.supabase.co";
    private readonly string _key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZ21sYmVuZm12bmZvYW12d2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NjE5NDQsImV4cCI6MjA2NzUzNzk0NH0.92S3AWVWvVkdbJGqsuzFJW9j6nXHFOK43IvfXbkEFrE"; // don’t commit secrets!

    public class RegisterRequest
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string IdNumber { get; set; }
        public string Password { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.Name) ||
            string.IsNullOrWhiteSpace(request.Surname) ||
            string.IsNullOrWhiteSpace(request.Role) ||
            string.IsNullOrWhiteSpace(request.IdNumber))
        {
            return BadRequest(new { message = "All fields are required: Name, Surname, Email, Role, IdNumber, Password." });
        }

        var supabase = new Client(_url, _key);
        await supabase.InitializeAsync();

        // Check if email exists
        var existingUsers = await supabase.From<User>()
            .Where(u => u.Email == request.Email)
            .Get();

        if (existingUsers.Models.Count > 0)
        {
            return Conflict(new { message = "Email already registered." });
        }

        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var newUser = new User
        {
            Name = request.Name,
            Surname = request.Surname,
            Email = request.Email,
            Role = request.Role,
            IdNumber = request.IdNumber,
            StartDate = DateTime.UtcNow,
            PasswordHash = hashedPassword
        };

        var insertResponse = await supabase.From<User>().Insert(newUser);

        if (insertResponse.Models.Count == 0)
        {
            return StatusCode(500, new { message = "Failed to create user." });
        }

        return Ok(new { message = "User registered successfully." });
    }
}

