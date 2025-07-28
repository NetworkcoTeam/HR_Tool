import LoginForm from '../Components/LoginForm';
import RegisterForm from '../Components/RegisterForm';
import './Landing.css';



function Landing() {
    return (
        <>
          
            

            < div className="Hero-grid"  >
       
        <div className="Hero-image">
         <img src="/images/hero-image.png" alt=" " className="HeroImg" />
        </div>

               <div className="text">
                
           <h1 className="header-message"> Simplify HR.<br/> Empower Teams </h1> 
            <h1 className="title-platform">All-in-one Platform</h1>
          <ul className="list">
          <li><i class="fa-regular fa-circle-check"/>Payroll</li>
          <li><i class="fa-regular fa-circle-check"/>Leave</li>
          <li><i class="fa-regular fa-circle-check"/>Contract</li>
          <li><i class="fa-regular fa-circle-check"/>Appointment</li>
          </ul>
          <p>New here?</p>
          
          <div className="registerButton">
             <RegisterForm />  
             </div>   

             <div className="loginbutton">
               <LoginForm />
             </div>
            
             </div>
 
         
        </div>
        <>
           
            </>
            
        </>
    );
}

export default Landing;