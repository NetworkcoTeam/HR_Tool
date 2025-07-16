import './Sidebar.css';
import {useNavigate} from 'react-router-dom';



function Sidebar() {
     const navigate =useNavigate();
   
    
    return(<>
<div className="sidebar">
            <h1 className='logo'>ATLASHR</h1> 
            <ul>
                <li onClick={()=>navigate('/home')}><i class="fa-solid fa-house" />Home</li><br/>
                <li onClick={()=>navigate('/profile')}>Profile</li><br/>
                 <li>Payslip</li><br/>
                  <li>Documents</li><br/>
                   <li onClick={()=>navigate('/leaveForm')}>Leave form </li><br/>
                    <li onClick={()=>navigate('/bookAppointment')}>Book appointment</li><br/>
                     <li><i class="fa-solid fa-arrow-right-form-bracket"/>Log out</li>
                      
            </ul>
        </div>
        </>

    )}

    export default Sidebar;