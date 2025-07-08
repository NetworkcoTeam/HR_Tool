import './HeroSection';

function HeroSection(){
    return(
        < div className="Hero-grid">
        <h1>Simplify HR </h1>
        <h2>Empower Teams</h2>
        <div className="Hero-image">
         <img src="/images/hero-image.png" alt=" " />
        </div>

          <div className="text">
          <ul>
          <li><img src="/images/check.png" alt ="" className="checkmark"/>Payroll</li>
          <li><img src="/images/check.png " alt=" " className="checkmark"/>Leave</li>
          <li><img src="/images/check.png "  alt="" className="checkmark"/>Contract</li>
          <li><img src="/images/check.png " alt=" " className="checkmark"/>Appointment</li>
          </ul>
          <button>Register</button>
          </div>
          


        </div>
    )
}
export default HeroSection;