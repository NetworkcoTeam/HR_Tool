using System;
using System.ComponentModel.DataAnnotations;

namespace HR_Tool.Api.Models
{
    public class Todo
    {
        public int Id { get; set; }  // Added for identification
        
        [Required]
        [StringLength(50, ErrorMessage = "Title cannot be longer than 50 characters.")]
        public string Title { get; set; }

        [Required]
        public DateTime DueDate { get; set; }

        [Required]
        public string Status { get; set; }

        [Required]
        [EnumDataType(typeof(Priority))]
        public Priority PriorityLevel { get; set; }  // Note: This was Priority in controller
        
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }  // Nullable for when not yet updated

        public enum Priority
        {
            Low,
            Medium,
            High
        }
    }
}