// File: Dtos/TodoDto.cs
namespace HR_Tool.Api.Models
{
public class TodoDto
{
    public int Id { get; set; }            // Optional, if you want to return it
    public string Title { get; set; }
    public string Status { get; set; }
    public DateTime? DueDate { get; set; }
    public string Priority { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}


}
