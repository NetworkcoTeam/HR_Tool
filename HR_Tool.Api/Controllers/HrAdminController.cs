using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Supabase;
using HR_Tool.Api.Models;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace HR_Tool.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HrAdminController : ControllerBase
    {
        private readonly Client _supabase;
        private readonly ILogger<HrAdminController> _logger;

        public HrAdminController(Client supabase, ILogger<HrAdminController> logger)
        {
            _supabase = supabase ?? throw new ArgumentNullException(nameof(supabase));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

[HttpGet("user/{idNumber}")]
public async Task<ActionResult<UserDetailsDto>> GetUserByIdNumber(string idNumber)
{
    if (string.IsNullOrEmpty(idNumber))
    {
        return BadRequest(new ErrorResponse { 
            Status = "ID Number is required" 
        });
    }

    try
    {
        var userQuery = _supabase.From<User>()
            .Where(u => u.IdNumber == idNumber);

        var userResponse = await userQuery.Get();

        if (userResponse?.Models == null || !userResponse.Models.Any())
        {
            return NotFound(new ErrorResponse { 
                Status = $"User with ID Number {idNumber} not found." 
            });
        }

        var user = userResponse.Models.First();

        return Ok(new UserDetailsDto
        {
            Status = user.Status,
            Name = user.Name,
            Surname = user.Surname,
            IdNumber = user.IdNumber
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new ErrorResponse {
            Status = $"An unexpected error occurred: {ex.Message}" 
        });
    }
}

public class ErrorResponse
{
    public string Status { get; set; }
}

        [HttpPost("admit-user")]
        public async Task<IActionResult> AdmitUser([FromBody] AdmitUserRequestDto request)
        {
            if (request == null)
            {
                _logger.LogWarning("Received null admission request");
                return BadRequest(new AdmitUserResponseDto { Success = false, Message = "Request body cannot be null." });
            }

            _logger.LogInformation("Received HR Admin admission request for user: {UserIdNumber}", request.UserIdNumber);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Admission request validation failed: {@Errors}", ModelState.Values.SelectMany(v => v.Errors));
                return BadRequest(new AdmitUserResponseDto 
                { 
                    Success = false, 
                    Message = "Validation failed: " + string.Join(", ", ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)))
                });
            }

            try
            {
                // 1. Find and Validate User
                var userQuery = _supabase.From<User>()
                    .Where(u => u.IdNumber == request.UserIdNumber);

                var userResponse = await userQuery.Get();

                if (userResponse?.Models == null || !userResponse.Models.Any())
                {
                    _logger.LogWarning("User with ID Number {UserIdNumber} not found for admission.", request.UserIdNumber);
                    return NotFound(new AdmitUserResponseDto 
                    { 
                        Success = false, 
                        Message = $"User with ID Number {request.UserIdNumber} not found." 
                    });
                }

                var user = userResponse.Models.First();

                if (user.Status == "Admitted")
                {
                    _logger.LogWarning("User with ID Number {UserIdNumber} is already admitted.", request.UserIdNumber);
                    return Conflict(new AdmitUserResponseDto 
                    { 
                        Success = false, 
                        Message = $"User with ID Number {request.UserIdNumber} is already admitted." 
                    });
                }

                // 2. Create Employee Record using request data
                var newEmployee = new Employee
                {
                    FirstName = request.EmployeeFirstName,
                    LastName = request.EmployeeLastName,
                    Position = request.EmployeePosition,
                    CreatedAt = DateTime.UtcNow
                };

                var employeeInsertResponse = await _supabase.From<Employee>()
                    .Insert(newEmployee);

                if (employeeInsertResponse?.Models == null || !employeeInsertResponse.Models.Any())
                {
                    var errorMessage = "Failed to create employee record.";
                    if (employeeInsertResponse?.ResponseMessage != null)
                    {
                        var responseContent = await employeeInsertResponse.ResponseMessage.Content.ReadAsStringAsync();
                        _logger.LogError("Failed to insert new employee for user {UserIdNumber}. Response: {Response}",
                            request.UserIdNumber, responseContent);
                        errorMessage += $" Details: {responseContent}";
                    }
                    throw new Exception(errorMessage);
                }

                var createdEmployee = employeeInsertResponse.Models.First();
                long newEmployeeId = createdEmployee.EmployeeId;

                _logger.LogInformation("Employee created successfully with ID: {EmployeeId}", newEmployeeId);

                // 3. Create Contract Record
                var newContract = new Contract
                {
                    EmployeeId = newEmployeeId,
                    ContractType = request.ContractType,
                    StartDate = request.ContractStartDate,
                    EndDate = request.ContractEndDate,
                    BasicSalary = request.BasicSalary,
                    Terms = request.ContractTerms,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                var contractInsertResponse = await _supabase.From<Contract>()
                    .Insert(newContract);

                if (contractInsertResponse?.Models == null || !contractInsertResponse.Models.Any())
                {
                    var errorMessage = "Failed to create contract record.";
                    if (contractInsertResponse?.ResponseMessage != null)
                    {
                        var responseContent = await contractInsertResponse.ResponseMessage.Content.ReadAsStringAsync();
                        _logger.LogError("Failed to insert new contract for employee {EmployeeId}. Response: {Response}",
                            newEmployeeId, responseContent);
                        errorMessage += $" Details: {responseContent}";
                    }
                    
                    try
                    {
                        await _supabase.From<Employee>()
                            .Where(e => e.EmployeeId == newEmployeeId)
                            .Delete();
                        _logger.LogInformation("Cleaned up employee record {EmployeeId} after contract creation failure", newEmployeeId);
                    }
                    catch (Exception cleanupEx)
                    {
                        _logger.LogError(cleanupEx, "Failed to cleanup employee record {EmployeeId} after contract creation failure", newEmployeeId);
                    }
                    
                    throw new Exception(errorMessage);
                }

                var createdContract = contractInsertResponse.Models.First();
                int newContractId = createdContract.ContractId;

                _logger.LogInformation("Contract created successfully with ID: {ContractId} for Employee: {EmployeeId}", 
                    newContractId, newEmployeeId);

                // 4. Update User Record
                var userUpdateResponse = await _supabase.From<User>()
                    .Where(u => u.IdNumber == request.UserIdNumber)
                    .Set(u => u.EmployeeId, newEmployeeId)
                    .Set(u => u.Status, "Admitted")
                    .Update();

                if (userUpdateResponse?.Models == null || !userUpdateResponse.Models.Any())
                {
                    var errorMessage = "Failed to update user status and link employee ID.";
                    if (userUpdateResponse?.ResponseMessage != null)
                    {
                        var responseContent = await userUpdateResponse.ResponseMessage.Content.ReadAsStringAsync();
                        _logger.LogError("Failed to update user {UserIdNumber}. Response: {Response}",
                            request.UserIdNumber, responseContent);
                        errorMessage += $" Details: {responseContent}";
                    }
                    try
                    {
                        await _supabase.From<Contract>()
                            .Where(c => c.ContractId == newContractId)
                            .Delete();
                        await _supabase.From<Employee>()
                            .Where(e => e.EmployeeId == newEmployeeId)
                            .Delete();
                        _logger.LogInformation("Cleaned up employee {EmployeeId} and contract {ContractId} records after user update failure", 
                            newEmployeeId, newContractId);
                    }
                    catch (Exception cleanupEx)
                    {
                        _logger.LogError(cleanupEx, "Failed to cleanup records after user update failure");
                    }

                    throw new Exception(errorMessage);
                }

                _logger.LogInformation("User {UserIdNumber} updated successfully with EmployeeId {EmployeeId} and status Admitted",
                    request.UserIdNumber, newEmployeeId);

                return Ok(new AdmitUserResponseDto
                {
                    Success = true,
                    Message = "User admitted, employee and contract created successfully!",
                    UserIdNumber = request.UserIdNumber,
                    EmployeeId = newEmployeeId,
                    ContractId = newContractId,
                    UserNewStatus = "Admitted"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred during user admission for ID Number {UserIdNumber}.", request.UserIdNumber);
                return StatusCode(500, new AdmitUserResponseDto
                {
                    Success = false,
                    Message = $"An unexpected error occurred: {ex.Message}"
                });
            }
        }
    }
}