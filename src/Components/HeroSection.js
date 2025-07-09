import './HeroSection';
//<!--do not use pictures as ticks, use icons instead-->
//do not make it a hero section, make it a landing page
function HeroSection(){
    return(<>
        <h1 className="header-message">Simplify HR </h1>
        <h2>Empower Teams</h2>
        < div className="Hero-grid">
       
        <div className="Hero-image">
         <img src="/images/hero-image.png" alt=" " className="HeroImg" />
        </div>
          

          <div className="text">
            <h1 className="title-platform">All-in-one Platform</h1>
          <ul className="list">
          <li><img src="/images/check.png" alt ="" className="checkmark"/>Payroll</li>
          <li><img src="/images/check.png " alt=" " className="checkmark"/>Leave</li>
          <li><img src="/images/check.png "  alt="" className="checkmark"/>Contract</li>
          <li><img src="/images/check.png " alt=" " className="checkmark"/>Appointment</li>
          
          </ul>
          <p>New here?</p>
          <button>Register</button>
          </div>
          


        </div>
        </>
    )
}
export default HeroSection;