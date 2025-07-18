using HR_Tool.Api.Models;
using HR_Tool.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Supabase;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Supabase.Postgrest.Models;

namespace HR_Tool.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PayslipsController : ControllerBase
    {
        private readonly PayslipCalculator _payslipCalculator;
        private readonly Client _supabase;

        public PayslipsController(PayslipCalculator payslipCalculator)
        {
            _payslipCalculator = payslipCalculator ?? throw new ArgumentNullException(nameof(payslipCalculator));

            var url = Environment.GetEnvironmentVariable("SUPABASE_URL");
            var key = Environment.GetEnvironmentVariable("SUPABASE_KEY");

            if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(key))
            {
                throw new Exception("Supabase environment variables (SUPABASE_URL or SUPABASE_KEY) are not set.");
            }

            _supabase = new Client(url, key);
        }

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

                // If EmployeeId is specified, generate for that employee
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
                    employees = await GetActiveEmployees();

                    if (employees == null || employees.Count == 0)
                        return NotFound("No active employees found");
                }

                var generatedPayslips = new List<PayslipDto>();

                foreach (var employee in employees)
                {
                    if (employee == null) continue;

                    var payslip = await GeneratePayslip(employee, request.Month, request.Year);

                    if (payslip != null)
                    {
                        generatedPayslips.Add(payslip);
                    }
                }

                return Ok(new
                {
                    success = true,
                    count = generatedPayslips.Count,
                    payslips = generatedPayslips
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception occurred during payslip generation:");
                Console.WriteLine(ex.ToString());

                return StatusCode(500, new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        private async Task<List<Employee>> GetActiveEmployees()
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

            await _supabase
                .From<Payslip>()
                .Insert(payslip);

            return new PayslipDto
            {
                EmployeeId = (int)payslip.EmployeeId,
                BasicSalary = payslip.BasicSalary,
                TaxAmount = payslip.TaxAmount ?? 0m,
                UIF = payslip.UIF ?? 0m,
                NetSalary = payslip.NetSalary ?? 0m,
                PeriodStart = payslip.PeriodStart,
                PeriodEnd = payslip.PeriodEnd,
                GeneratedAt = payslip.GeneratedAt ?? DateTime.UtcNow
            };
        }
    }

    public class PayslipGenerationRequest
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public int? EmployeeId { get; set; } // Optional: for individual generation
    }

    public class PayslipDto
    {
        public int EmployeeId { get; set; }
        public decimal BasicSalary { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal UIF { get; set; }
        public decimal NetSalary { get; set; }
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
}
