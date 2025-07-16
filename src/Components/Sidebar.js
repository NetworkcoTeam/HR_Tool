import './Sidebar.css';
import {Link} from 'react-router-dom';
import LeaveForm from '../Pages/LeaveForm';

function Sidebar() {
    return(
<div className="sidebar">
            <h1>ATLASHR</h1>
            <ul>
                <li><i class="fa-solid fa-house" />Home</li><br/>
                <li><i class="fa-regular fa-circle-user"/>Profile</li><br/>
                 <li>Payslip</li><br/>
                  <li>Documents</li><br/>
                   <li><Link to="/leaveForm" onClick={<LeaveForm />} >Leave form </Link></li><br/>
                    <li><i class="fa-solid fa-calendar-check"/>Book appointment</li><br/>
                     <li><i class="fa-solid fa-arrow-right-form-bracket"/>Log out</li>
                      
            </ul>
        </div>

    )}

    export default Sidebar;