using Microsoft.AspNetCore.Mvc;
using Supabase;
using HR_Tool.Api.Models;

[ApiController]
[Route("[controller]")]
public class SupabaseTestController : ControllerBase
{
    [HttpGet("employees")]
    public async Task<IActionResult> GetEmployees()
    {
        var url = Environment.GetEnvironmentVariable("SUPABASE_URL");
        var key = Environment.GetEnvironmentVariable("SUPABASE_KEY");
        var supabase = new Client(url, key);
        await supabase.InitializeAsync();

        var response = await supabase.From<Employee>().Get();
        return Ok(response.Models);
    }
}