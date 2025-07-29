using System.Reflection;
using HR_Tool.Api.Models;
using HR_Tool.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Supabase;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Supabase.Postgrest.Models;
using System.Linq;
using PdfSharp.Pdf;
using PdfSharp.Drawing;
using System.IO;
using PdfSharp.Fonts;
using Microsoft.AspNetCore.Hosting;

namespace HR_Tool.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PayslipsController : ControllerBase
    {
        private readonly PayslipCalculator _payslipCalculator;
        private readonly Client _supabase;
        private readonly IWebHostEnvironment _webHostEnvironment;

         public PayslipsController(PayslipCalculator payslipCalculator, IWebHostEnvironment webHostEnvironment)
        {
            _payslipCalculator = payslipCalculator ?? throw new ArgumentNullException(nameof(payslipCalculator));
            _webHostEnvironment = webHostEnvironment ?? throw new ArgumentNullException(nameof(webHostEnvironment));

            var url = Environment.GetEnvironmentVariable("SUPABASE_URL");
            var key = Environment.GetEnvironmentVariable("SUPABASE_KEY");

            if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(key))
            {
                throw new Exception("Supabase environment variables (SUPABASE_URL or SUPABASE_KEY) are not set.");
            }

            _supabase = new Client(url, key);
            
            // Initialize font resolver
            if (GlobalFontSettings.FontResolver == null)
            {
                GlobalFontSettings.FontResolver = new RobotoFontResolver();
            }
        }

        /// <summary>
        /// HR Admin: Generates payslips for specified employees or positions and returns summary info.
        /// </summary>
        [HttpPost("generate")]
        public async Task<IActionResult> GeneratePayslips([FromBody] PayslipGenerationRequest request)
        {
            if (request == null)
                return BadRequest("Request cannot be null");

            if (request.Month < 1 || request.Month > 12)
                return BadRequest("Month must be between 1 and 12");

            if (request.Year < 2000 || request.Year > DateTime.Now.Year + 1)
                return BadRequest("Invalid year");

            try
            {
                List<Employee> employees;

                if (request.EmployeeId.HasValue)
                {
                    var employeeResponse = await _supabase
                        .From<Employee>()
                        .Where(x => x.EmployeeId == request.EmployeeId.Value)
                        .Single();

                    if (employeeResponse == null)
                        return NotFound($"Employee with ID {request.EmployeeId} not found");

                    employees = new List<Employee> { employeeResponse };
                }
                else
                {
                    employees = await GetActiveEmployees(request.Position);

                    if (employees == null || employees.Count == 0)
                    {
                        var message = !string.IsNullOrEmpty(request.Position)
                            ? $"No active employees found with position '{request.Position}'"
                            : "No active employees found";
                        return NotFound(message);
                    }
                }

                var generatedPayslips = new List<EmployeeSlipInfo>();

                foreach (var employee in employees)
                {
                    if (employee == null) continue;

                    var payslip = await GeneratePayslip(employee, request.Month, request.Year);

                    if (payslip != null)
                    {
                        generatedPayslips.Add(new EmployeeSlipInfo
                        {
                            Name = employee.FirstName,
                            Surname = employee.LastName,
                            Position = employee.Position,
                            EmployeeId = (int)employee.EmployeeId
                        });
                    }
                }

                return Ok(new
                {
                    success = true,
                    count = generatedPayslips.Count,
                    position = request.Position ?? "All positions",
                    employees = generatedPayslips
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }

        

        [HttpGet("employee/{employeeId}/payslips")]
        public async Task<IActionResult> GetEmployeePayslips(int employeeId)
        {
            try
            {
                var payslipsResponse = await _supabase
                    .From<Payslip>()
                    .Where(x => x.EmployeeId == employeeId)
                    .Order(x => x.PeriodEnd, Supabase.Postgrest.Constants.Ordering.Descending)
                    .Get();

                if (payslipsResponse?.Models == null)
                    return Ok(new { success = true, payslips = new List<object>() });

                var payslipMonths = payslipsResponse.Models.Select(p => new
                {
                    MonthName = p.PeriodEnd.ToString("MMMM"), 
                    MonthNumber = p.PeriodEnd.Month,         
                    Year = p.PeriodEnd.Year,                 
                    PaySlipId = p.PaySlipId,
                    PeriodEnd = p.PeriodEnd.ToString("yyyy-MM-dd") 
                }).ToList();


                return Ok(new
                {
                    success = true,
                    payslips = payslipMonths
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }

        [HttpGet("view/{employeeId}/{year}/{month}")]
        public async Task<IActionResult> ViewPayslipByMonth(int employeeId, int year, int month)
        {
            try
            {
                // First validate the month is between 1-12
                if (month < 1 || month > 12)
                {
                    return BadRequest(new
                    {
                        success = false,
                        error = "Month must be between 1 and 12"
                    });
                }

                // Calculate the date range for the requested month/year
                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);

                var payslipResponse = await _supabase
                    .From<Payslip>()
                    .Where(x => x.EmployeeId == employeeId)
                    .Where(x => x.PeriodEnd >= startDate && x.PeriodEnd <= endDate)
                    .Single();

                if (payslipResponse == null)
                {
                    return NotFound(new 
                    {
                        success = false,
                        error = $"No payslip found for employee {employeeId} in {year}-{month}"
                    });
                }

                // Get employee details
                var employeeResponse = await _supabase
                    .From<Employee>()
                    .Where(x => x.EmployeeId == payslipResponse.EmployeeId)
                    .Single();

                return Ok(new
                {
                    success = true,
                    payslip = new
                    {
                        PaySlipId = payslipResponse.PaySlipId,
                        EmployeeName = $"{employeeResponse?.FirstName} {employeeResponse?.LastName}".Trim(),
                        Position = employeeResponse?.Position ?? "Not specified",
                        Period = $"{payslipResponse.PeriodStart:dd MMM yyyy} - {payslipResponse.PeriodEnd:dd MMM yyyy}",
                        BasicSalary = payslipResponse.BasicSalary,
                        TaxAmount = payslipResponse.TaxAmount ?? 0m,
                        UIF = payslipResponse.UIF ?? 0m,
                        NetSalary = payslipResponse.NetSalary ?? 0m,
                        GeneratedDate = payslipResponse.GeneratedAt?.ToString("dd MMM yyyy HH:mm") ?? "N/A"
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = $"Error retrieving payslip information: {ex.Message}"
                });
            }
        }

        [HttpGet("download/{employeeId}/{year}/{month}")]
        public async Task<IActionResult> DownloadPayslipByMonth(int employeeId, int year, int month)
        {
            try
            {
                // Validate month input
                if (month < 1 || month > 12)
                {
                    return BadRequest("Month must be between 1 and 12");
                }

                // Calculate date range for the requested month/year
                var startDate = new DateTime(year, month, 1);
                var endDate = startDate.AddMonths(1).AddDays(-1);

                var payslipResponse = await _supabase
                    .From<Payslip>()
                    .Where(x => x.EmployeeId == employeeId)
                    .Where(x => x.PeriodEnd >= startDate && x.PeriodEnd <= endDate)
                    .Single();

                if (payslipResponse == null)
                {
                    return NotFound($"No payslip found for employee {employeeId} in {year}-{month}");
                }

                // Get employee details
                var employeeResponse = await _supabase
                    .From<Employee>()
                    .Where(x => x.EmployeeId == payslipResponse.EmployeeId)
                    .Single();

                // DTO
                var payslipDto = new PayslipDto
                {
                    PaySlipId = payslipResponse.PaySlipId,
                    EmployeeId = (int)payslipResponse.EmployeeId,
                    EmployeeName = $"{employeeResponse?.FirstName} {employeeResponse?.LastName}".Trim(),
                    Position = employeeResponse?.Position ?? "Not specified",
                    BasicSalary = payslipResponse.BasicSalary,
                    TaxAmount = payslipResponse.TaxAmount ?? 0m,
                    UIF = payslipResponse.UIF ?? 0m,
                    NetSalary = payslipResponse.NetSalary ?? 0m,
                    PeriodStart = payslipResponse.PeriodStart,
                    PeriodEnd = payslipResponse.PeriodEnd,
                    GeneratedAt = payslipResponse.GeneratedAt ?? DateTime.UtcNow
                };

                var pdfBytes = GeneratePayslipPdf(payslipDto);
                var fileName = $"Payslip_{payslipDto.EmployeeName}_{payslipDto.PeriodEnd:yyyy_MM}.pdf";
                
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error generating PDF: {ex.Message}");
            }
        }
        private async Task<PayslipDto> MapToDto(Payslip payslip)
        {
            // Fetch employee data separately
            var employeeResponse = await _supabase
                .From<Employee>()
                .Where(x => x.EmployeeId == payslip.EmployeeId)
                .Single();

            return new PayslipDto
            {
                PaySlipId = payslip.PaySlipId,
                EmployeeId = (int)payslip.EmployeeId,
                EmployeeName = employeeResponse != null 
                    ? $"{employeeResponse.FirstName} {employeeResponse.LastName}".Trim()
                    : "Unknown Employee",
                Position = employeeResponse?.Position ?? "Not specified",
                BasicSalary = payslip.BasicSalary,
                TaxAmount = payslip.TaxAmount ?? 0m,
                UIF = payslip.UIF ?? 0m,
                NetSalary = payslip.NetSalary ?? 0m,
                PeriodStart = payslip.PeriodStart,
                PeriodEnd = payslip.PeriodEnd,
                GeneratedAt = payslip.GeneratedAt ?? DateTime.UtcNow
            };
        }

        private async Task<PayslipDto?> GetPayslipWithEmployeeDetails(int paySlipId)
        {
            try
            {
                var payslipResponse = await _supabase
                    .From<Payslip>()
                    .Where(x => x.PaySlipId == paySlipId)
                    .Single();

                if (payslipResponse == null) return null;

                return await MapToDto(payslipResponse);
            }
            catch
            {
                return null;
            }
        }

        //PDF PAYSLIP
         private byte[] GeneratePayslipPdf(PayslipDto payslip)
        {
            var document = new PdfDocument();
            var page = document.AddPage();
            var graphics = XGraphics.FromPdfPage(page);

            // Define fonts
            var normalFont = new XFont("Roboto", 10);
            var boldFont = new XFont("Roboto", 12, XFontStyleEx.Bold);
            var headerFont = new XFont("Roboto", 18, XFontStyleEx.Bold);
            var italicFont = new XFont("Roboto", 8, XFontStyleEx.Italic);

            var yPosition = 50;
            var xPosition = 50; 

            string logoPath = Path.Combine(_webHostEnvironment.ContentRootPath, "Images", "the_network_company_sa_logo.jpeg");

            try
            {
                if (System.IO.File.Exists(logoPath))
                {
                    XImage logo = XImage.FromFile(logoPath);

                    // Define logo position and size
                    double logoWidth = 100; // Adjust as needed
                    double logoHeight = logo.PixelHeight * logoWidth / logo.PixelWidth; // Maintain aspect ratio

                    graphics.DrawImage(logo, xPosition, yPosition, logoWidth, logoHeight);

                    // Adjust yPosition for text after logo
                    yPosition += (int)logoHeight / 2; // Move down to align text with middle of logo
                    xPosition += (int)logoWidth + 10; // Move X position to the right of the logo, with some padding
                }
                else
                {
                    // If logo not found, just start text from original xPosition
                    Console.WriteLine($"Logo file not found: {logoPath}"); // For debugging
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error loading logo: {ex.Message}");
                xPosition = 50;
            }
            // Company Header (now next to the logo)
            // If logo was drawn, xPosition is already adjusted
            graphics.DrawString("THE NETWORKCO", headerFont, XBrushes.Black, new XPoint(xPosition, yPosition));
            yPosition += 25; // Move down for the next line
            graphics.DrawString("1 Asparagus Rd, Office Park, Midrand, 1686", normalFont, XBrushes.Black, new XPoint(xPosition, yPosition));
            yPosition += 20;
            graphics.DrawString("Contact: info@networkco.com | 087 711 0008 ", normalFont, XBrushes.Black, new XPoint(xPosition, yPosition));
            yPosition += 40; // Add more space after company details

            // Title (centered as before)
            graphics.DrawString("PAYSLIP", headerFont, XBrushes.Black, 
                new XPoint(page.Width / 2 - graphics.MeasureString("PAYSLIP", headerFont).Width / 2, yPosition));
            yPosition += 10;

            graphics.DrawString($"  No.: {payslip.PaySlipId}", italicFont, XBrushes.Black,
            new XPoint(page.Width / 2, yPosition), XStringFormats.Center);
            yPosition += 30;

            // Employee Details
            graphics.DrawString("EMPLOYEE DETAILS", boldFont, XBrushes.DarkBlue, new XPoint(50, yPosition));
            yPosition += 20;
            graphics.DrawString($"Employee Name: {payslip.EmployeeName}", normalFont, XBrushes.Black, new XPoint(50, yPosition));
            yPosition += 20;
            graphics.DrawString($"Employee ID: {payslip.EmployeeId}", normalFont, XBrushes.Black, new XPoint(50, yPosition));
            yPosition += 20;
            graphics.DrawString($"Position: {payslip.Position}", normalFont, XBrushes.Black, new XPoint(50, yPosition));
            yPosition += 20;
            graphics.DrawString($"Pay Period: {payslip.PeriodStart:dd MMMM yyyy} - {payslip.PeriodEnd:dd MMMM yyyy}", normalFont, XBrushes.Black, new XPoint(50, yPosition));
            yPosition += 30;

            // Earnings Section
            graphics.DrawString("EARNINGS", boldFont, XBrushes.DarkGreen, new XPoint(50, yPosition));
            yPosition += 20;
            graphics.DrawString($"Basic Salary:", normalFont, XBrushes.Black, new XPoint(50, yPosition));
            graphics.DrawString($"R{payslip.BasicSalary:N2}", normalFont, XBrushes.Black, 
                new XPoint(page.Width - 100, yPosition), XStringFormats.TopRight);
            yPosition += 40;

            // Deductions Section
            graphics.DrawString("DEDUCTIONS", boldFont, XBrushes.DarkRed, new XPoint(50, yPosition));
            yPosition += 20;
            graphics.DrawString($"PAYE Tax:", normalFont, XBrushes.Black, new XPoint(50, yPosition));
            graphics.DrawString($"R{payslip.TaxAmount:N2}", normalFont, XBrushes.Black, 
                new XPoint(page.Width - 100, yPosition), XStringFormats.TopRight);
            yPosition += 20;
            graphics.DrawString($"UIF Contribution:", normalFont, XBrushes.Black, new XPoint(50, yPosition));
            graphics.DrawString($"R{payslip.UIF:N2}", normalFont, XBrushes.Black, 
                new XPoint(page.Width - 100, yPosition), XStringFormats.TopRight);
            yPosition += 40;

            // Net Salary
            graphics.DrawLine(XPens.Black, 50, yPosition, page.Width - 50, yPosition);
            yPosition += 10;
            graphics.DrawString("NET SALARY:", boldFont, XBrushes.Black, new XPoint(50, yPosition));
            graphics.DrawString($"R{payslip.NetSalary:N2}", boldFont, XBrushes.Black, 
                new XPoint(page.Width - 100, yPosition), XStringFormats.TopRight);
            yPosition += 30;
            graphics.DrawLine(XPens.Black, 50, yPosition, page.Width - 50, yPosition);

            // Footer
            yPosition = (int)page.Height - 50;
            graphics.DrawString($"Generated: {payslip.GeneratedAt:dd MMMM yyyy HH:mm}", italicFont, XBrushes.Gray, new XPoint(50, yPosition));
            graphics.DrawString("This is an automatically generated payslip. No signature required.", 
                italicFont, XBrushes.Gray, 
                new XPoint(page.Width / 2 - graphics.MeasureString("This is an automatically generated payslip. No signature required.", italicFont).Width / 2, yPosition));

            using var stream = new MemoryStream();
            document.Save(stream);
            return stream.ToArray();
        }


        private async Task<List<Employee>> GetActiveEmployees(string position = null)
        {
            var contractsResponse = await _supabase
                .From<Contract>()
                .Where(x => x.IsActive == true)
                .Get();

            if (contractsResponse?.Models == null)
                return new List<Employee>();

            var employees = new List<Employee>();

            foreach (var contract in contractsResponse.Models)
            {
                if (contract == null) continue;

                var employeeResponse = await _supabase
                    .From<Employee>()
                    .Where(x => x.EmployeeId == contract.EmployeeId)
                    .Single();

                if (employeeResponse != null)
                {
                    employees.Add(employeeResponse);
                }
            }

            if (!string.IsNullOrEmpty(position))
            {
                employees = employees.Where(emp =>
                    !string.IsNullOrEmpty(emp.Position) &&
                    emp.Position.Equals(position, StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            return employees;
        }

        private async Task<PayslipDto?> GeneratePayslip(Employee employee, int month, int year)
        {
            if (employee == null)
                throw new ArgumentNullException(nameof(employee));

            var contractResponse = await _supabase
                .From<Contract>()
                .Where(x => x.EmployeeId == employee.EmployeeId)
                .Single();

            if (contractResponse == null)
                return null;

            var periodStart = new DateTime(year, month, 1);
            var periodEnd = new DateTime(year, month, DateTime.DaysInMonth(year, month));

            var (tax, uif, net, _) = _payslipCalculator.Calculate(contractResponse.BasicSalary.ToString());

            var payslip = new Payslip
            {
                EmployeeId = (int)employee.EmployeeId,
                PeriodStart = periodStart,
                PeriodEnd = periodEnd,
                BasicSalary = contractResponse.BasicSalary,
                TaxAmount = tax,
                UIF = uif,
                NetSalary = net,
                GeneratedAt = DateTime.UtcNow
            };

            var insertedPayslipResponse = await _supabase
                .From<Payslip>()
                .Insert(payslip);

            if (insertedPayslipResponse?.Models == null || !insertedPayslipResponse.Models.Any())
            {
                throw new Exception("Failed to insert payslip into database.");
            }

            var insertedPayslip = insertedPayslipResponse.Models.First();

            return new PayslipDto
            {
                PaySlipId = insertedPayslip.PaySlipId,
                EmployeeId = (int)insertedPayslip.EmployeeId,
                EmployeeName = $"{employee.FirstName} {employee.LastName}",
                Position = employee.Position,
                BasicSalary = insertedPayslip.BasicSalary,
                TaxAmount = insertedPayslip.TaxAmount ?? 0m,
                UIF = insertedPayslip.UIF ?? 0m,
                NetSalary = insertedPayslip.NetSalary ?? 0m,
                PeriodStart = insertedPayslip.PeriodStart,
                PeriodEnd = insertedPayslip.PeriodEnd,
                GeneratedAt = insertedPayslip.GeneratedAt ?? DateTime.UtcNow
            };
        }
    }

    public class RobotoFontResolver : IFontResolver
    {
        public FontResolverInfo ResolveTypeface(string familyName, bool isBold, bool isItalic)
        {
            string faceName = "Roboto";
            
            if (isBold && isItalic)
                return new FontResolverInfo($"{faceName}-BoldItalic");
            if (isBold)
                return new FontResolverInfo($"{faceName}-Bold");
            if (isItalic)
                return new FontResolverInfo($"{faceName}-Italic");
            
            return new FontResolverInfo($"{faceName}-Regular");
        }

        public byte[] GetFont(string faceName)
        {
            switch (faceName)
            {
                case "Roboto-Regular":
                    return LoadFontData("HR_Tool.Api.Fonts.Roboto-Regular.ttf");
                case "Roboto-Bold":
                    return LoadFontData("HR_Tool.Api.Fonts.Roboto-Bold.ttf");
                case "Roboto-Italic":
                    return LoadFontData("HR_Tool.Api.Fonts.Roboto-Italic.ttf");
                case "Roboto-BoldItalic":
                    return LoadFontData("HR_Tool.Api.Fonts.Roboto-BoldItalic.ttf");
                default:
                    return LoadFontData("HR_Tool.Api.Fonts.Roboto-Regular.ttf");
            }
        }

        private byte[] LoadFontData(string resourceName)
        {
            var assembly = Assembly.GetExecutingAssembly();
            using var stream = assembly.GetManifestResourceStream(resourceName);
            if (stream == null) 
                throw new FileNotFoundException($"Font resource '{resourceName}' not found.");
            
            using var ms = new MemoryStream();
            stream.CopyTo(ms);
            return ms.ToArray();
        }
    }

    public class PayslipGenerationRequest
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public int? EmployeeId { get; set; }
        public string? Position { get; set; }
    }

    public class EmployeeSlipInfo
    {
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string? Position { get; set; }
        public int EmployeeId { get; set; }
    }

    public class PayslipDto
    {
        public int PaySlipId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string? Position { get; set; }
        public decimal BasicSalary { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal UIF { get; set; }
        public decimal NetSalary { get; set; }
        public decimal DeductibleAmount { get; set; }
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
} 