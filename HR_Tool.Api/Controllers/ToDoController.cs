using Microsoft.AspNetCore.Mvc;
using HR_Tool.Api.Models;
using Supabase;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System;

namespace HR_Tool.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TodoController : ControllerBase
    {
        private readonly Client _supabase;

        public TodoController(Client supabase)
        {
            _supabase = supabase;
        }

        // GET: api/todo
        [HttpGet]
        public async Task<IActionResult> GetTodos()
        {
            var response = await _supabase.From<Todo>().Get();

            // Map to DTO to avoid serialization issues
            var todosDto = response.Models.Select(t => new TodoDto
            {
                Id = t.Id,
                Title = t.Title,
                Status = t.Status,
                DueDate = t.DueDate,
                Priority = t.Priority,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            }).ToList();

            return Ok(todosDto);
        }

        // POST: api/todo
        [HttpPost]
public async Task<IActionResult> CreateTodo([FromBody] TodoDto dto)
{
    // Add validation
    if (dto.EmployeeId <= 0)
    {
        return BadRequest("EmployeeId must be a positive number");
    }

    var todo = new Todo
    {
        Title = dto.Title,
        Status = dto.Status,
        DueDate = dto.DueDate,
        Priority = dto.Priority,
        EmployeeId = dto.EmployeeId, // THIS WASN'T BEING SET
        CreatedAt = DateTime.UtcNow,
        UpdatedAt = DateTime.UtcNow
    };

    Console.WriteLine($"Creating todo for EmployeeId: {todo.EmployeeId}"); // Debug log

    var response = await _supabase.From<Todo>().Insert(todo);

    // Return the created todo with its EmployeeId
    return Ok(new TodoDto
    {
        Id = response.Model.Id,
        Title = response.Model.Title,
        Status = response.Model.Status,
        DueDate = response.Model.DueDate,
        Priority = response.Model.Priority,
        EmployeeId = response.Model.EmployeeId, // Include in response
        CreatedAt = response.Model.CreatedAt,
        UpdatedAt = response.Model.UpdatedAt
    });
}
[HttpGet("employee/{employeeId}")]
public async Task<IActionResult> GetTodosByEmployee(long employeeId)
{
    var response = await _supabase
        .From<Todo>()
        .Where(t => t.EmployeeId == employeeId)
        .Get();

    if (response.Models == null || response.Models.Count == 0)
        return NotFound();

    var todosDto = response.Models.Select(t => new TodoDto
    {
        Id = t.Id,
        Title = t.Title,
        Status = t.Status,
        DueDate = t.DueDate,
        Priority = t.Priority,
        CreatedAt = t.CreatedAt,
        UpdatedAt = t.UpdatedAt
    }).ToList();

    return Ok(todosDto);
}
        // PUT: api/todo/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTodo(int id, [FromBody] TodoDto dto)
        {
            var existing = await _supabase.From<Todo>().Where(t => t.Id == id).Single();
            if (existing == null) return NotFound();

            existing.Title = dto.Title;
            existing.Status = dto.Status;
            existing.DueDate = dto.DueDate;
            existing.Priority = dto.Priority;
            existing.UpdatedAt = DateTime.UtcNow;

            var response = await _supabase.From<Todo>().Update(existing);

            var updatedDto = new TodoDto
            {
                Id = response.Model.Id,
                Title = response.Model.Title,
                Status = response.Model.Status,
                DueDate = response.Model.DueDate,
                Priority = response.Model.Priority,
                CreatedAt = response.Model.CreatedAt,
                UpdatedAt = response.Model.UpdatedAt
            };

            return Ok(updatedDto);
        }

        // DELETE: api/todo/{id}
        [HttpDelete("{id}")]
public async Task<IActionResult> DeleteTodo(int id)
{
    var existing = await _supabase.From<Todo>().Where(t => t.Id == id).Single();
    
    if (existing == null)
        return NotFound(new { message = $"Todo with ID {id} not found." });

    var deleteResponse = await _supabase.From<Todo>().Delete(existing);

    if (deleteResponse.ResponseMessage.IsSuccessStatusCode)
    {
        return Ok(new { message = "Todo deleted successfully." });
    }
    else
    {
        return StatusCode((int)deleteResponse.ResponseMessage.StatusCode, new
        {
            message = "Failed to delete todo.",
            detail = await deleteResponse.ResponseMessage.Content.ReadAsStringAsync()
        });
    }
}

    }
}
