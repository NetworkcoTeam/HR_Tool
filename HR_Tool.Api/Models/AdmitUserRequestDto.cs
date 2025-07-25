using System;
using System.ComponentModel.DataAnnotations;

namespace HR_Tool.Api.Models
{
    public class AdmitUserRequestDto
    {
        [Required(ErrorMessage = "User ID Number is required")]
        [StringLength(20, ErrorMessage = "User ID Number cannot exceed 20 characters")]
        public string UserIdNumber { get; set; }

        [Required(ErrorMessage = "Employee first name is required")]
        [StringLength(50, ErrorMessage = "First name cannot exceed 50 characters")]
        public string EmployeeFirstName { get; set; }

        [Required(ErrorMessage = "Employee last name is required")]
        [StringLength(50, ErrorMessage = "Last name cannot exceed 50 characters")]
        public string EmployeeLastName { get; set; }

        [Required(ErrorMessage = "Employee position is required")]
        [StringLength(100, ErrorMessage = "Position cannot exceed 100 characters")]
        public string EmployeePosition { get; set; }

        [Required(ErrorMessage = "Contract type is required")]
        [StringLength(50, ErrorMessage = "Contract type cannot exceed 50 characters")]
        public string ContractType { get; set; }

        [Required(ErrorMessage = "Contract start date is required")]
        public DateTime ContractStartDate { get; set; }

        public DateTime? ContractEndDate { get; set; } // Optional for permanent contracts

        [Required(ErrorMessage = "Basic salary is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Basic salary must be greater than 0")]
        public decimal BasicSalary { get; set; }

        [StringLength(1000, ErrorMessage = "Contract terms cannot exceed 1000 characters")]
        public string ContractTerms { get; set; }
    }
}