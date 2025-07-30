using Microsoft.AspNetCore.Mvc;
using Supabase;
using HR_Tool.Api.Models;
using BCrypt.Net;
using System.Net.Mail;
using System.Net;
using System.Text;
using Microsoft.Extensions.Configuration;

[ApiController]
[Route("api/[controller]")]
public class PasswordResetController : ControllerBase
{
    private readonly Client _supabase;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PasswordResetController> _logger;

    public PasswordResetController(IConfiguration configuration, ILogger<PasswordResetController> logger)
    {
        var url = Environment.GetEnvironmentVariable("SUPABASE_URL");
        var key = Environment.GetEnvironmentVariable("SUPABASE_KEY");

        if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(key))
        {
            throw new Exception("Supabase environment variables (SUPABASE_URL or SUPABASE_KEY) are not set.");
        }

        _supabase = new Client(url, key);
        _configuration = configuration;
        _logger = logger;
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; }
    }

    public class ResetPasswordRequest
    {
        public string Token { get; set; }
        public string NewPassword { get; set; }
    }

    public class ValidateTokenRequest
    {
        public string Token { get; set; }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { message = "Email is required." });
            }

            await _supabase.InitializeAsync();

            // Check if user exists
            var response = await _supabase.From<User>()
                .Where(u => u.Email == request.Email)
                .Get();

            var user = response.Models.FirstOrDefault();

            if (user == null)
            {
                _logger.LogInformation($"Password reset requested for non-existent email: {request.Email}");
                return Ok(new { message = "If this email exists in our system, you will receive a password reset link." });
            }

            // Generate secure token
            var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");

            var expiry = DateTime.UtcNow.AddMinutes(30); // Token valid for 30 minutes

            // Update user with reset token
            user.ResetToken = token;
            user.ResetTokenExpiry = expiry;
            await _supabase.From<User>().Update(user);

            // Send email
            await SendPasswordResetEmail(user.Email, token);

            _logger.LogInformation($"Password reset email sent to: {request.Email}");
            return Ok(new { message = "If this email exists in our system, you will receive a password reset link." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ForgotPassword");
            return StatusCode(500, new { message = "An error occurred while processing your request." });
        }
    }

    [HttpPost("validate-token")]
    public async Task<IActionResult> ValidateToken([FromBody] ValidateTokenRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Token))
            {
                return BadRequest(new { message = "Token is required." });
            }

            await _supabase.InitializeAsync();

            var response = await _supabase.From<User>()
                .Where(u => u.ResetToken == request.Token && u.ResetTokenExpiry > DateTime.UtcNow)
                .Get();

            if (response.Models.Any())
            {
                return Ok(new { valid = true });
            }

            return Ok(new { valid = false, message = "Invalid or expired token." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ValidateToken");
            return StatusCode(500, new { message = "An error occurred while validating token." });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new { message = "Token and new password are required." });
            }

            if (request.NewPassword.Length < 8)
            {
                return BadRequest(new { message = "Password must be at least 8 characters." });
            }

            await _supabase.InitializeAsync();

            // Find user with valid token
            var response = await _supabase.From<User>()
                .Where(u => u.ResetToken == request.Token && u.ResetTokenExpiry > DateTime.UtcNow)
                .Get();

            var user = response.Models.FirstOrDefault();

            if (user == null)
            {
                return BadRequest(new { message = "Invalid or expired token." });
            }

            // Update password and clear token
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            user.ResetToken = null;
            user.ResetTokenExpiry = null;

            await _supabase.From<User>().Update(user);

            _logger.LogInformation($"Password reset successful for user: {user.Email}");
            return Ok(new { message = "Password has been reset successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in ResetPassword");
            return StatusCode(500, new { message = "An error occurred while resetting password." });
        }
    }

    private async Task SendPasswordResetEmail(string email, string token)
    {
        var smtpSettings = _configuration.GetSection("SmtpSettings");
        var appSettings = _configuration.GetSection("AppSettings");

        using var mailMessage = new MailMessage
        {
            From = new MailAddress(smtpSettings["FromEmail"]),
            Subject = "Password Reset Request",
            Body = BuildEmailBody(token, appSettings["BaseUrl"]),
            IsBodyHtml = true
        };

        mailMessage.To.Add(email);

        using var smtpClient = new SmtpClient(smtpSettings["Server"])
        {
            Port = int.Parse(smtpSettings["Port"]),
            Credentials = new NetworkCredential(smtpSettings["Username"], smtpSettings["Password"]),
            EnableSsl = bool.Parse(smtpSettings["EnableSsl"]),
        };

        await smtpClient.SendMailAsync(mailMessage);
    }

    private string BuildEmailBody(string token, string baseUrl)
    {
        var resetLink = $"{baseUrl}/reset-password/{token}";
        
        return $@"
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <h2 style='color: #333;'>Password Reset Request</h2>
            <p>We received a request to reset your password. Click the button below to proceed:</p>
            
            <a href='{resetLink}' 
               style='display: inline-block; padding: 10px 20px; background-color: #4CAF50; 
                      color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;'>
               Reset Password
            </a>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style='word-break: break-all;'>{resetLink}</p>
            
            <p>If you didn't request this, please ignore this email. The link will expire in 1 hour.</p>
            
            <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;'>
            <p style='font-size: 12px; color: #777;'>
                For security reasons, we don't store your password. This link can only be used once.
            </p>
        </div>";
    }
}