using DotNetEnv;
using HR_Tool.Api.Services;
using Supabase;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env file
// Note: In production, you should use actual environment variables rather than .env files
Env.Load(@"..\Backend\.env"); // Adjust path if needed

// Add services to the container.
 // Add this at the top if missing

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });


// PayslipCalculator
builder.Services.AddScoped<PayslipCalculator>();

// Configure Supabase client
var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL") ?? 
                throw new Exception("SUPABASE_URL environment variable is not set.");
var supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_KEY") ?? 
                throw new Exception("SUPABASE_KEY environment variable is not set.");

builder.Services.AddScoped<Client>(_ => 
{
    var client = new Client(supabaseUrl, supabaseKey);
    client.InitializeAsync().Wait(); // Initialize synchronously for DI
    return client;
});

// Add Swagger support via Swashbuckle
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:3000", "https://hr-tool-61cz.onrender.com")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

var app = builder.Build();

app.UseCors("AllowFrontend");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
