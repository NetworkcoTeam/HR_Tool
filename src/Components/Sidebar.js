import './sidebar.css';

function Sidebar() {
    return(
<div className="sidebar">
            <h1>ATLASHR</h1>
            <ul>
                <li><i class="fa-solid fa-house" />Home</li>
                <li><i class="fa-regular fa-circle-user"/>Profile</li>
                 <li>Payslip</li>
                  <li>Documents</li>
                   <li><i class="fa-solid fa-calendar-days"/>Leave form</li>
                    <li><i class="fa-solid fa-calendar-check"/>Book appointment</li>
                     <li><i class="fa-solid fa-arrow-right-form-bracket"/>Log out</li>
                      
            </ul>
        </div>

    )}

    export default Sidebar;