using Microsoft.AspNetCore.Mvc;
using Supabase;
using HR_Tool.Api.Models;
using BCrypt.Net;


[ApiController]
[Route("api/[controller]")]
public class RegisterController : ControllerBase
{
    //private readonly string _url = Environment.GetEnvironmentVariable("SUPABASE_URL");
    //private readonly string _key = Environment.GetEnvironmentVariable("SUPABASE_KEY");
private readonly string _url ="https://mdgmlbenfmvnfoamvwkr.supabase.co";
private readonly string _key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kZ21sYmVuZm12bmZvYW12d2tyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5NjE5NDQsImV4cCI6MjA2NzUzNzk0NH0.92S3AWVWvVkdbJGqsuzFJW9j6nXHFOK43IvfXbkEFrE";

    public class RegisterRequest
    {
        public string Email { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
    }

    [HttpPost]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email, Username, and Password are required." });
        }

        var supabase = new Client(_url, _key);
        await supabase.InitializeAsync();

        // Optional: check if user already exists
        var existingUsers = await supabase.From<User>()
            .Where(u => u.Email == request.Email)
            .Get();

        if (existingUsers.Models.Count > 0)
        {
            return Conflict(new { message = "Email already registered." });
        }

        // Hash password before saving (recommended)
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var newUser = new User
        {
            Email = request.Email,
            Username = request.Username,
            PasswordHash = hashedPassword // Assuming you have this property
        };

        var insertResponse = await supabase.From<User>().Insert(newUser);

        if (insertResponse.Models.Count == 0)
        {
            return StatusCode(500, new { message = "Failed to create user." });
        }

        return Ok(new { message = "User registered successfully." });
    }
}
