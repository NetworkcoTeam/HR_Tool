using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using HR_Tool.Api.Models;

namespace HR_Tool.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ToDoController : ControllerBase
    {
        private static List<Todo> _toDoList = new List<Todo>();
        private static int _nextId = 1;

        [HttpGet]
        public IActionResult GetAll()
        {
            return Ok(_toDoList);
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var todo = _toDoList.FirstOrDefault(t => t.Id == id);
            if (todo == null)
            {
                return NotFound();
            }
            return Ok(todo);
        }

        [HttpPost]
        public IActionResult Create([FromBody] Todo todo)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            todo.Id = _nextId++;
            todo.CreatedAt = DateTime.UtcNow;
            _toDoList.Add(todo);

            return CreatedAtAction(nameof(GetById), new { id = todo.Id }, todo);
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Todo updatedTodo)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingTodo = _toDoList.FirstOrDefault(t => t.Id == id);
            if (existingTodo == null)
            {
                return NotFound();
            }

            existingTodo.Title = updatedTodo.Title;
            existingTodo.DueDate = updatedTodo.DueDate;
            existingTodo.Status = updatedTodo.Status;
            existingTodo.PriorityLevel = updatedTodo.PriorityLevel;  // Fixed property name
            existingTodo.UpdatedAt = DateTime.UtcNow;

            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var todo = _toDoList.FirstOrDefault(t => t.Id == id);
            if (todo == null)
            {
                return NotFound();
            }

            _toDoList.Remove(todo);
            return NoContent();
        }
    }
}