using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Supabase;
using HR_Tool.Api.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

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
                return BadRequest(new ErrorResponse
                {
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
                    return NotFound(new ErrorResponse
                    {
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
                return StatusCode(500, new ErrorResponse
                {
                    Status = $"An unexpected error occurred: {ex.Message}"
                });
            }
        }

        // get all users who are not admitted
        [HttpGet("non-admitted-users")]
        public async Task<ActionResult<List<UserDetailsDto>>> GetNonAdmittedUsers()
        {
            try
            {
                var userQuery = _supabase.From<User>()
                    .Where(u => u.Status == "Pending");

                var userResponse = await userQuery.Get();

                if (userResponse?.Models == null)
                {
                    return Ok(new List<UserDetailsDto>());
                }

                var users = userResponse.Models.Select(u => new UserDetailsDto
                {
                    Status = u.Status,
                    Name = u.Name,
                    Surname = u.Surname,
                    IdNumber = u.IdNumber,
                    EmployeeId = u.EmployeeId
                }).ToList();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching non-admitted users");
                return StatusCode(500, new ErrorResponse
                {
                    Status = $"An unexpected error occurred: {ex.Message}"
                });
            }
        }

        [HttpGet("admitted-users")]
        public async Task<ActionResult<List<UserDetailsDto>>> GetAdmittedUsers()
        {
            try
            {
                var userQuery = _supabase.From<User>()
                    .Where(u => u.Status == "Admitted");

                var userResponse = await userQuery.Get();

                if (userResponse?.Models == null)
                {
                    return Ok(new List<UserDetailsDto>());
                }

                var users = userResponse.Models.Select(u => new UserDetailsDto
                {
                    Status = u.Status,
                    Name = u.Name,
                    Surname = u.Surname,
                    IdNumber = u.IdNumber,
                    EmployeeId = u.EmployeeId
                }).ToList();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching admitted users");
                return StatusCode(500);
            }
        }

        [HttpGet("all-users")]
        public async Task<ActionResult<List<UserDetailsDto>>> GetAllUsers()
        {
            try
            {
                var userQuery = _supabase.From<User>();
                var userResponse = await userQuery.Get();

                if (userResponse?.Models == null)
                {
                    return Ok(new List<UserDetailsDto>());
                }

                var users = userResponse.Models.Select(u => new UserDetailsDto
                {
                    Status = u.Status,
                    Name = u.Name,
                    Surname = u.Surname,
                    IdNumber = u.IdNumber,
                    EmployeeId = u.EmployeeId
                }).ToList();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all users");
                return StatusCode(500);
            }
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
                    UserId = request.UserIdNumber,
                    FirstName = request.EmployeeFirstName,
                    LastName = request.EmployeeLastName,
                    Position = request.EmployeePosition,
                    Department = request.Department,
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
                    StartDate = DateTime.Parse(request.ContractStartDate),  // Add parsing
                    EndDate = !string.IsNullOrEmpty(request.ContractEndDate)
                    ? DateTime.Parse(request.ContractEndDate)
                    : (DateTime?)null,
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

        [HttpGet("contracts/employee/{employeeId}")]
        public async Task<ActionResult<ContractDto>> GetContractByEmployeeId(long employeeId)
        {
            try
            {
                // Get the contract
                var contractResponse = await _supabase.From<Contract>()
                    .Where(c => c.EmployeeId == employeeId)
                    .Single();

                if (contractResponse == null)
                {
                    return NotFound(new ErrorResponse
                    {
                        Status = $"Contract for employee ID {employeeId} not found."
                    });
                }

                // Get the employee details
                var employeeResponse = await _supabase.From<Employee>()
                    .Where(e => e.EmployeeId == employeeId)
                    .Single();

                if (employeeResponse == null)
                {
                    return NotFound(new ErrorResponse
                    {
                        Status = $"Employee with ID {employeeId} not found."
                    });
                }

                // Map to enhanced ContractDto with employee details included
                var contractDto = new ContractDto
                {
                    ContractId = contractResponse.ContractId,
                    EmployeeId = contractResponse.EmployeeId,
                    FirstName = employeeResponse.FirstName,
                    LastName = employeeResponse.LastName,
                    Position = employeeResponse.Position,
                    Department = employeeResponse.Department,
                    ContractType = contractResponse.ContractType,
                    StartDate = contractResponse.StartDate,
                    EndDate = contractResponse.EndDate,
                    BasicSalary = contractResponse.BasicSalary,
                    Allowance = contractResponse.Allowance,
                    Terms = contractResponse.Terms,
                    IsActive = contractResponse.IsActive,
                    CreatedAt = contractResponse.CreatedAt,
                    UpdatedAt = contractResponse.UpdatedAt
                };

                return Ok(contractDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ErrorResponse
                {
                    Status = $"An unexpected error occurred: {ex.Message}"
                });
            }
        }
[HttpPut("contracts/{contractId}")]
public async Task<IActionResult> UpdateContract(int contractId, [FromBody] ContractDto updatedContractDto)
{
    if (updatedContractDto == null)
    {
        return BadRequest(new ErrorResponse
        {
            Status = "Contract data is required"
        });
    }

    try
    {
        // Ensure we're updating the correct contract
        if (updatedContractDto.ContractId != contractId)
        {
            return BadRequest(new ErrorResponse
            {
                Status = "Contract ID mismatch"
            });
        }

        // First get the existing contract to preserve any fields we're not updating
        var existingContract = await _supabase.From<Contract>()
            .Where(c => c.ContractId == contractId)
            .Single();

        if (existingContract == null)
        {
            return NotFound(new ErrorResponse
            {
                Status = $"Contract with ID {contractId} not found."
            });
        }

        // Update contract fields with proper null handling
        existingContract.ContractType = updatedContractDto.ContractType;
        existingContract.StartDate = updatedContractDto.StartDate;
        existingContract.EndDate = updatedContractDto.EndDate;
        existingContract.BasicSalary = updatedContractDto.BasicSalary;
       existingContract.Allowance = updatedContractDto.Allowance; // Proper null handling
        existingContract.Terms = updatedContractDto.Terms;
        existingContract.IsActive = updatedContractDto.IsActive;
        existingContract.UpdatedAt = DateTime.UtcNow;

        // Update the contract
        var contractUpdateResponse = await _supabase.From<Contract>()
            .Where(c => c.ContractId == contractId)
            .Set(c => c.ContractType, existingContract.ContractType)
            .Set(c => c.StartDate, existingContract.StartDate)
            .Set(c => c.EndDate, existingContract.EndDate)
            .Set(c => c.BasicSalary, existingContract.BasicSalary)
            .Set(c => c.Allowance, existingContract.Allowance)
            .Set(c => c.Terms, existingContract.Terms)
            .Set(c => c.IsActive, existingContract.IsActive)
            .Set(c => c.UpdatedAt, existingContract.UpdatedAt)
            .Update();

        if (contractUpdateResponse?.Models == null || !contractUpdateResponse.Models.Any())
        {
            return StatusCode(500, new ErrorResponse
            {
                Status = "Failed to update contract"
            });
        }

        // Update employee details if provided
        if (!string.IsNullOrEmpty(updatedContractDto.Position) || !string.IsNullOrEmpty(updatedContractDto.Department))
        {
            var employeeUpdateResponse = await _supabase.From<Employee>()
                .Where(e => e.EmployeeId == existingContract.EmployeeId)
                .Set(e => e.Position, updatedContractDto.Position ?? string.Empty)
                .Set(e => e.Department, updatedContractDto.Department ?? string.Empty)
                .Update();

            if (employeeUpdateResponse?.Models == null || !employeeUpdateResponse.Models.Any())
            {
                _logger.LogWarning("Failed to update employee position/department for EmployeeId: {EmployeeId}", 
                    existingContract.EmployeeId);
            }
            else
            {
                _logger.LogInformation("Successfully updated employee position/department for EmployeeId: {EmployeeId}", 
                    existingContract.EmployeeId);
            }
        }

        // Get the updated contract with employee details for the response
        var updatedContract = contractUpdateResponse.Models.First();

        // Fetch updated employee details
        var employeeResponse = await _supabase.From<Employee>()
            .Where(e => e.EmployeeId == updatedContract.EmployeeId)
            .Single();

        var resultDto = new ContractDto
        {
            ContractId = updatedContract.ContractId,
            EmployeeId = updatedContract.EmployeeId,
            FirstName = employeeResponse?.FirstName,
            LastName = employeeResponse?.LastName,
            Position = employeeResponse?.Position,
            Department = employeeResponse?.Department,
            ContractType = updatedContract.ContractType,
            StartDate = updatedContract.StartDate,
            EndDate = updatedContract.EndDate,
            BasicSalary = updatedContract.BasicSalary,
            Allowance = updatedContract.Allowance,
            Terms = updatedContract.Terms,
            IsActive = updatedContract.IsActive,
            CreatedAt = updatedContract.CreatedAt,
            UpdatedAt = updatedContract.UpdatedAt
        };

        return Ok(resultDto);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error updating contract {ContractId}", contractId);
        return StatusCode(500, new ErrorResponse
        {
            Status = $"An unexpected error occurred: {ex.Message}"
        });
    }
}
        [HttpPost("offboard-user/{idNumber}")]
        public async Task<IActionResult> OffboardUser(string idNumber)
        {
            try
            {
                // Find the user to offboard 
                var userQuery = _supabase.From<User>()
                    .Where(u => u.IdNumber == idNumber && u.Status == "Admitted");

                var userResponse = await userQuery.Get();

                if (userResponse?.Models == null || !userResponse.Models.Any())
                {
                    return NotFound(new { Success = false, Message = "Admitted user not found." });
                }

                var user = userResponse.Models.First();

                // Create archived user record
                var archivedUser = new archived_users
                {
                    Name = user.Name,
                    Surname = user.Surname,
                    Email = user.Email,
                    Role = user.Role,
                    IdNumber = user.IdNumber,
                    StartDate = user.StartDate,
                    PasswordHash = user.PasswordHash,
                    Status = "Offboarded",
                    EmployeeId = user.EmployeeId,
                    ResetToken = user.ResetToken,
                    ResetTokenExpiry = user.ResetTokenExpiry,
                    LastPasswordReset = user.LastPasswordReset,
                    ArchivedAt = DateTime.UtcNow
                };

                // Add to archived users table
                var archiveResponse = await _supabase.From<archived_users>()
                    .Insert(archivedUser);

                if (archiveResponse?.Models == null || !archiveResponse.Models.Any())
                {
                    throw new Exception("Failed to archive user");
                }

                // Remove from active users table
                await _supabase.From<User>()
                    .Where(u => u.IdNumber == idNumber)
                    .Delete();

                return Ok(new { Success = true, Message = "User offboarded successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error offboarding user with ID: {IdNumber}", idNumber);
                return StatusCode(500, new { Success = false, Message = $"Error offboarding user: {ex.Message}" });
            }
        }

        [HttpGet("offboarded-users")]
        public async Task<ActionResult<List<ArchivedUserDto>>> GetOffboardedUsers()
        {
            try
            {
                var response = await _supabase.From<archived_users>().Get();

                if (response?.Models == null)
                {
                    return Ok(new List<ArchivedUserDto>());
                }

                return Ok(response.Models.Select(u => new ArchivedUserDto
                {
                    IdNumber = u.IdNumber,
                    Name = u.Name,
                    Surname = u.Surname,
                    Status = u.Status,
                    ArchivedAt = u.ArchivedAt,
                    EmployeeId = u.EmployeeId
                }).ToList());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching offboarded users");
                return StatusCode(500);
            }
        }
    }

    public class ErrorResponse
    {
        public string Status { get; set; }
    }

    public class ArchivedUserDto
    {
        public string IdNumber { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string Status { get; set; }
        public DateTime ArchivedAt { get; set; }
        public long? EmployeeId { get; set; }
    }

    public class AdmitUserRequestDto
    {
        public string UserIdNumber { get; set; }
        public string EmployeeFirstName { get; set; }
        public string EmployeeLastName { get; set; }
        public string EmployeePosition { get; set; }
        public string Department { get; set; }
        public string ContractType { get; set; }
        public string ContractStartDate { get; set; }
        public string ContractEndDate { get; set; }
        public decimal BasicSalary { get; set; }
        public string ContractTerms { get; set; }
    }

    public class AdmitUserResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string UserIdNumber { get; set; }
        public long EmployeeId { get; set; }
        public int ContractId { get; set; }
        public string UserNewStatus { get; set; }
    }

    public class UserDetailsDto
    {
        public string Status { get; set; }
        public string Name { get; set; }
        public string Surname { get; set; }
        public string IdNumber { get; set; }
        public long? EmployeeId { get; set; }
    }

    public class ContractDto
    {
        public int ContractId { get; set; }
        public long EmployeeId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Position { get; set; }
        public string Department { get; set; }
        public string ContractType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal BasicSalary { get; set; }
        public decimal? Allowance { get; set; }
        public string Terms { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}