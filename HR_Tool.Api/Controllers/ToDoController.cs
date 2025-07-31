using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Supabase;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using HR_Tool.Api.Models;

namespace HR_Tool.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ToDoController : ControllerBase
    {
        private readonly Client _supabase;
        private readonly ILogger<ToDoController> _logger;

        public ToDoController(Client supabase, ILogger<ToDoController> logger)
        {
            _supabase = supabase;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var response = await _supabase.From<Todo>().Get();
                
                if (response?.Models == null)
                {
                    return Ok(new List<TodoDto>());
                }

                var todos = response.Models.Select(t => new TodoDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    DueDate = t.DueDate,
                    Status = t.Status,
                    PriorityLevel = t.PriorityLevel,
                    CreatedAt = t.CreatedAt,
                    UpdatedAt = t.UpdatedAt
                }).ToList();

                return Ok(todos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching todos");
                return StatusCode(500, new { error = "Failed to fetch todos", message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var response = await _supabase.From<Todo>().Where(x => x.Id == id).Get();
                var todo = response?.Models?.FirstOrDefault();
                
                if (todo == null)
                    return NotFound(new { error = "Todo not found" });

                var todoDto = new TodoDto
                {
                    Id = todo.Id,
                    Title = todo.Title,
                    DueDate = todo.DueDate,
                    Status = todo.Status,
                    PriorityLevel = todo.PriorityLevel,
                    CreatedAt = todo.CreatedAt,
                    UpdatedAt = todo.UpdatedAt
                };

                return Ok(todoDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching todo with id {Id}", id);
                return StatusCode(500, new { error = "Failed to fetch todo", message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTodoRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { error = "Request body is required" });
                }

                if (string.IsNullOrWhiteSpace(request.Title))
                {
                    return BadRequest(new { error = "Title is required" });
                }

                var todo = new Todo
                {
                    Title = request.Title.Trim(),
                    DueDate = request.DueDate,
                    Status = !string.IsNullOrWhiteSpace(request.Status) ? request.Status : "Pending",
                    PriorityLevel = !string.IsNullOrWhiteSpace(request.PriorityLevel) ? request.PriorityLevel : "Medium",
                    CreatedAt = DateTime.UtcNow
                };

                _logger.LogInformation("Creating todo: {Title}, Due: {DueDate}, Status: {Status}, Priority: {Priority}", 
                    todo.Title, todo.DueDate, todo.Status, todo.PriorityLevel);

                var response = await _supabase.From<Todo>().Insert(todo);
                
                if (response?.Models?.Any() != true)
                {
                    return StatusCode(500, new { error = "Failed to create todo - no data returned from database" });
                }

                var createdTodo = response.Models.First();
                _logger.LogInformation("Successfully created todo with ID: {Id}", createdTodo.Id);

                var todoDto = new TodoDto
                {
                    Id = createdTodo.Id,
                    Title = createdTodo.Title,
                    DueDate = createdTodo.DueDate,
                    Status = createdTodo.Status,
                    PriorityLevel = createdTodo.PriorityLevel,
                    CreatedAt = createdTodo.CreatedAt,
                    UpdatedAt = createdTodo.UpdatedAt
                };

                return CreatedAtAction(nameof(GetById), new { id = createdTodo.Id }, todoDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating todo");
                return StatusCode(500, new { error = "Failed to create todo", message = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTodoRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new { error = "Request body is required" });
                }

                var existingResponse = await _supabase.From<Todo>().Where(x => x.Id == id).Get();
                var existing = existingResponse?.Models?.FirstOrDefault();

                if (existing == null)
                {
                    return NotFound(new { error = "Todo not found" });
                }

                if (!string.IsNullOrWhiteSpace(request.Title))
                    existing.Title = request.Title.Trim();
                
                if (request.DueDate.HasValue)
                    existing.DueDate = request.DueDate.Value;
                
                if (!string.IsNullOrWhiteSpace(request.Status))
                    existing.Status = request.Status;
                
                if (!string.IsNullOrWhiteSpace(request.PriorityLevel))
                    existing.PriorityLevel = request.PriorityLevel;

                existing.UpdatedAt = DateTime.UtcNow;

                var updateResponse = await _supabase.From<Todo>().Update(existing);
                
                if (updateResponse?.Models?.Any() != true)
                {
                    return StatusCode(500, new { error = "Failed to update todo" });
                }

                var updatedTodo = updateResponse.Models.First();
                
                var todoDto = new TodoDto
                {
                    Id = updatedTodo.Id,
                    Title = updatedTodo.Title,
                    DueDate = updatedTodo.DueDate,
                    Status = updatedTodo.Status,
                    PriorityLevel = updatedTodo.PriorityLevel,
                    CreatedAt = updatedTodo.CreatedAt,
                    UpdatedAt = updatedTodo.UpdatedAt
                };

                return Ok(new { message = "Todo updated successfully", todo = todoDto });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating todo with id {Id}", id);
                return StatusCode(500, new { error = "Failed to update todo", message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var existingResponse = await _supabase.From<Todo>().Where(x => x.Id == id).Get();
                var existing = existingResponse?.Models?.FirstOrDefault();

                if (existing == null)
                {
                    return NotFound(new { error = "Todo not found" });
                }

                await _supabase.From<Todo>().Delete(existing);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting todo with id {Id}", id);
                return StatusCode(500, new { error = "Failed to delete todo", message = ex.Message });
            }
        }
    }

    public class CreateTodoRequest
    {
        public string Title { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; }
        public string PriorityLevel { get; set; }
    }

    public class UpdateTodoRequest
    {
        public string Title { get; set; }
        public DateTime? DueDate { get; set; }
        public string Status { get; set; }
        public string PriorityLevel { get; set; }
    }
}