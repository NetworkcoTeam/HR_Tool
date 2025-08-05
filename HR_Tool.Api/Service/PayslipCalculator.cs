namespace HR_Tool.Api.Services
{
public class PayslipCalculator
{
    public (decimal tax, decimal uif, decimal net, string bracket) Calculate(decimal basicSalary, decimal allowance = 0, decimal bonus = 0)
    {
        var totalMonthlySalary = basicSalary + allowance + bonus;
        var annualIncome = totalMonthlySalary * 12;

        decimal taxBeforeRebate;
        string bracket;

        if (annualIncome <= 237_100)
        {
            taxBeforeRebate = annualIncome * 0.18m;
            bracket = "18%";
        }
        else if (annualIncome <= 370_500)
        {
            taxBeforeRebate = 42_678 + (annualIncome - 237_100) * 0.26m;
            bracket = "26%";
        }
        else if (annualIncome <= 512_800)
        {
            taxBeforeRebate = 77_362 + (annualIncome - 370_500) * 0.31m;
            bracket = "31%";
        }
        else if (annualIncome <= 673_000)
        {
            taxBeforeRebate = 121_475 + (annualIncome - 512_800) * 0.36m;
            bracket = "36%";
        }
        else if (annualIncome <= 857_900)
        {
            taxBeforeRebate = 179_147 + (annualIncome - 673_000) * 0.39m;
            bracket = "39%";
        }
        else if (annualIncome <= 1_817_000)
        {
            taxBeforeRebate = 251_258 + (annualIncome - 857_900) * 0.41m;
            bracket = "41%";
        }
        else
        {
            taxBeforeRebate = 644_489 + (annualIncome - 1_817_000) * 0.45m;
            bracket = "45%";
        }

        decimal rebate = 17_235;
        decimal taxAfterRebate = Math.Max(taxBeforeRebate - rebate, 0);
        decimal monthlyTax = taxAfterRebate / 12;

        // UIF is calculated on total monthly salary (basic + allowance + bonus)
        decimal uif = totalMonthlySalary * 0.01m;
        if (uif > 177.12m) uif = 177.12m;

        decimal net = totalMonthlySalary - monthlyTax - uif;

        return (monthlyTax, uif, net, bracket);
    }

    public (decimal tax, decimal uif, decimal net, string bracket) Calculate(string salaryString)
    {
        if (!decimal.TryParse(salaryString, out decimal salary))
            throw new Exception("Invalid salary format");

        return Calculate(salary, 0, 0);
    }
}
}