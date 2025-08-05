namespace HR_Tool.Api.Models
{
    public class ContractDto
    {
        public int ContractId { get; set; }
        public long EmployeeId { get; set; }
        
        // Employee details (nullable for backward compatibility)
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Position { get; set; }
        public string? Department { get; set; }
        
        // Contract details
        public string ContractType { get; set; } 
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal BasicSalary { get; set; }
        public decimal? Allowance { get; set; }
        public string Terms { get; set; } 
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}