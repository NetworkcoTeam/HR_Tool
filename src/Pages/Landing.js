
import RegisterForm from '../Components/RegisterForm';
import './Landing.css';



function Landing() {
    return (
        <>
           <h1 className="header-message">Simplify HR </h1> 
            <h2>Empower Teams</h2>

            < div className="Hero-grid">
       
        <div className="Hero-image">
         <img src="/images/hero-image.png" alt=" " className="HeroImg" />
        </div>

               <div className="text">
            <h1 className="title-platform">All-in-one Platform</h1>
          <ul className="list">
          <li><i class="fa-regular fa-circle-check"/>Payroll</li>
          <li><i class="fa-regular fa-circle-check"/>Leave</li>
          <li><i class="fa-regular fa-circle-check"/>Contract</li>
          <li><i class="fa-regular fa-circle-check"/>Appointment</li>
          </ul>
          <p>New here?</p>
             <RegisterForm />
          </div>


        </div>
            
            
            
        </>
    );
}

export default Landing;