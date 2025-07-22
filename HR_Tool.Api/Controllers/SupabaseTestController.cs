using Microsoft.AspNetCore.Mvc;
using Supabase;
using HR_Tool.Api.Models;
using BCrypt.Net;


[ApiController]
[Route("api/[controller]")]
public class RegisterController : ControllerBase
{
    private readonly Client _supabase;

    public RegisterController()
    {
        var url = Environment.GetEnvironmentVariable("SUPABASE_URL");
        var key = Environment.GetEnvironmentVariable("SUPABASE_KEY");

        if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(key))
        {
            throw new Exception("Supabase environment variables (SUPABASE_URL or SUPABASE_KEY) are not set.");
        }

        _supabase = new Client(url, key);
    }

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

        await _supabase.InitializeAsync();

        // Check if email exists
        var existingUsers = await _supabase.From<User>()
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

        var insertResponse = await _supabase.From<User>().Insert(newUser);

        if (insertResponse.Models.Count == 0)
        {
            return StatusCode(500, new { message = "Failed to create user." });
        }

        return Ok(new { message = "User registered successfully." });
    }
}

