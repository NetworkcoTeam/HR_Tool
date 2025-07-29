using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Supabase;
using HR_Tool.Api.Models;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class DocumentController : ControllerBase
{
    private readonly Client _supabase;
    private readonly IWebHostEnvironment _environment;
    private readonly string _uploadPath;

    public DocumentController(IWebHostEnvironment environment)
    {
        var url = Environment.GetEnvironmentVariable("SUPABASE_URL");
        var key = Environment.GetEnvironmentVariable("SUPABASE_KEY");

        if (string.IsNullOrEmpty(url) || string.IsNullOrEmpty(key))
        {
            throw new Exception("Supabase environment variables (SUPABASE_URL or SUPABASE_KEY) are not set.");
        }

        _supabase = new Client(url, key);
        _environment = environment;
        _uploadPath = Path.Combine(_environment.ContentRootPath, "uploads", "documents");
        
        // Ensure upload directory exists
        if (!Directory.Exists(_uploadPath))
        {
            Directory.CreateDirectory(_uploadPath);
        }
    }

    public class DocumentUploadRequest
    {
        public long EmployeeId { get; set; }
        public string DocType { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public IFormFile File { get; set; } = null!;
    }

    // Get all documents for current employee
    [HttpGet]
    public async Task<IActionResult> GetDocuments([FromQuery] long? employeeId = null)
    {
        try
        {
            await _supabase.InitializeAsync();

            // FIX: Use Postgrest directly instead of From<T>
            var query = _supabase.Postgrest.Table<Document>();
            
            if (employeeId.HasValue)
            {
                query = query.Where(d => d.EmployeeId == employeeId.Value);
            }

            var documents = await query
                .Order("created_at", Supabase.Postgrest.Constants.Ordering.Descending)
                .Get();

            var documentList = documents.Models.Select(d => new
            {
                d.DocId,
                d.EmployeeId,
                d.DocName,
                d.DocType,
                d.LastName,
                d.CreatedAt,
                FileSize = d.FileSize,
                FileName = d.DocName,
                FileType = d.DocType,
                UploadDate = d.CreatedAt
            }).ToList();

            return Ok(documentList);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve documents", error = ex.Message });
        }
    }

    // Upload document
    [HttpPost("upload")]
    public async Task<IActionResult> UploadDocument([FromForm] DocumentUploadRequest request)
    {
        try
        {
            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            if (request.EmployeeId <= 0)
            {
                return BadRequest(new { message = "Valid Employee ID is required" });
            }

            if (string.IsNullOrWhiteSpace(request.DocType) || string.IsNullOrWhiteSpace(request.LastName))
            {
                return BadRequest(new { message = "Document type and last name are required" });
            }

            // Validate file type
            var allowedTypes = new[] { ".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".txt" };
            var fileExtension = Path.GetExtension(request.File.FileName).ToLower();
            
            if (!allowedTypes.Contains(fileExtension))
            {
                return BadRequest(new { message = "File type not allowed. Allowed types: PDF, DOC, DOCX, JPG, JPEG, PNG, TXT" });
            }

            // Generate unique filename
            var uniqueFileName = $"{request.EmployeeId}_{request.DocType}_{Guid.NewGuid():N}{fileExtension}";
            var filePath = Path.Combine(_uploadPath, uniqueFileName);

            // Save file to disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            await _supabase.InitializeAsync();

            // Create document record
            var document = new Document
            {
                EmployeeId = request.EmployeeId,
                DocName = uniqueFileName,
                DocType = request.DocType,
                LastName = request.LastName,
                CreatedAt = DateTime.UtcNow,
                FileSize = request.File.Length
            };

            var insertResponse = await _supabase.Postgrest.Table<Document>().Insert(document);

            if (insertResponse.Models.Count == 0)
            {
                // Clean up file if database insert failed
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
                return StatusCode(500, new { message = "Failed to save document record" });
            }

            return Ok(new 
            { 
                message = "Document uploaded successfully",
                document = new
                {
                    docId = insertResponse.Models.First().DocId,
                    fileName = request.File.FileName,
                    docType = request.DocType,
                    fileSize = request.File.Length
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to upload document", error = ex.Message });
        }
    }

    [HttpGet("download/{docId}")]
public async Task<IActionResult> DownloadDocument(long docId)  
{
    try
    {
        if (docId <= 0)  // Add validation for minimum ID
        {
            return BadRequest("Invalid document ID");
        }

        await _supabase.InitializeAsync();

        var document = await _supabase.Postgrest.Table<Document>()
            .Where(d => d.DocId == docId)
            .Single();

            if (document == null)
            {
                return NotFound(new { message = "Document not found" });
            }

            var filePath = Path.Combine(_uploadPath, document.DocName);

            if (!System.IO.File.Exists(filePath))
            {
                return NotFound(new { message = "File not found on server" });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var contentType = GetContentType(document.DocName);
            var originalFileName = GetOriginalFileName(document.DocName);

            return File(fileBytes, contentType, originalFileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to download document", error = ex.Message });
        }
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetDocumentsByEmployee(long employeeId)
    {
        try
        {
            await _supabase.InitializeAsync();

            var employee = await _supabase.Postgrest.Table<Employee>()
                .Where(e => e.EmployeeId == employeeId)
                .Single();

            if (employee == null)
            {
                return NotFound(new { message = "Employee not found" });
            }

            var documents = await _supabase.Postgrest.Table<Document>()
                .Where(d => d.EmployeeId == employeeId)
                .Order("created_at", Supabase.Postgrest.Constants.Ordering.Descending)
                .Get();

            var documentList = documents.Models.Select(d => new
            {
                d.DocId,
                d.EmployeeId,
                d.DocName,
                d.DocType,
                d.LastName,
                d.CreatedAt,
                FileSize = d.FileSize,
                FileName = GetOriginalFileName(d.DocName),
                FileType = d.DocType,
                UploadDate = d.CreatedAt,
                Employee = new
                {
                    employee.FirstName,
                    employee.LastName,
                    employee.Position,
                    employee.Department
                }
            }).ToList();

            return Ok(new
            {
                employee = new
                {
                    employee.EmployeeId,
                    employee.FirstName,
                    employee.LastName,
                    employee.Position,
                    employee.Department
                },
                documents = documentList
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve employee documents", error = ex.Message });
        }
    }

    [HttpDelete("{docId}")]
    public async Task<IActionResult> DeleteDocument(long docId) 
    {
        try
        {
            // Validate the ID is positive
            if (docId <= 0)
            {
                return BadRequest(new { message = "Invalid document ID" });
            }

            await _supabase.InitializeAsync();

            
            var document = await _supabase.Postgrest.Table<Document>()
                .Where(d => d.DocId == docId) 
                .Single();

            if (document == null)
            {
                return NotFound(new { message = "Document not found" });
            }

            // Delete from database
            await _supabase.Postgrest.Table<Document>()
                .Where(d => d.DocId == docId)
                .Delete();

            // Delete file from disk
            var filePath = Path.Combine(_uploadPath, document.DocName);
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            return Ok(new { message = "Document deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to delete document", error = ex.Message });
        }
    }

    [HttpGet("search-employees")]
    public async Task<IActionResult> SearchEmployees([FromQuery] string? search = null)
    {
        try
        {
            await _supabase.InitializeAsync();

            // FIX: Use Postgrest directly
            var query = _supabase.Postgrest.Table<Employee>();

            if (!string.IsNullOrWhiteSpace(search))
            {
                // Search by employee ID, first name, or last name
                if (long.TryParse(search, out long employeeId))
                {
                    query = query.Where(e => e.EmployeeId == employeeId);
                }
                else
                {
                    query = query.Where(e => e.FirstName.Contains(search) || e.LastName.Contains(search));
                }
            }

            var employees = await query
                .Order("employee_id", Supabase.Postgrest.Constants.Ordering.Ascending)
                .Limit(50)
                .Get();

            var employeeList = employees.Models.Select(e => new
            {
                e.EmployeeId,
                e.FirstName,
                e.LastName,
                e.Position,
                e.Department,
                e.HireDate,
                FullName = $"{e.FirstName} {e.LastName}"
            }).ToList();

            return Ok(employeeList);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to search employees", error = ex.Message });
        }
    }

    private string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLower();
        return extension switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".txt" => "text/plain",
            _ => "application/octet-stream"
        };
    }

    private string GetOriginalFileName(string storedFileName)
    {
        var parts = storedFileName.Split('_');
        if (parts.Length >= 3)
        {
            var guidPart = parts[2];
            var extension = Path.GetExtension(guidPart);
            return $"document{extension}";
        }
        return storedFileName;
    }
}