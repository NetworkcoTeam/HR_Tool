import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { FaHouse, FaUser, FaFileInvoiceDollar, FaFolder, FaCalendarCheck, FaRightFromBracket } from 'react-icons/fa6';

function AdminSidebar() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar">
      <h1 className='logo'>ATLASHR</h1>
      <ul className="sidebar-menu">
        <li onClick={() => handleNavigation('/Admin')}>
          <FaHouse className="sidebar-icon" />
          <span>Home</span>
        </li>
        
        <li onClick={() => handleNavigation('/profile')}>
          <FaUser className="sidebar-icon" />
          <span>Profile</span>
        </li>
        
        {/*<li onClick={() => handleNavigation('/')}>
          <FaFileInvoiceDollar className="sidebar-icon" />
          <span>Payslip</span>
        </li>*/}
        
        <li onClick={() => handleNavigation('/documents')}>
          <FaFolder className="sidebar-icon" />
          <span>Documents</span>
        </li>
        
        <li onClick={() => handleNavigation('/LeaveManagement')}>
          <FaCalendarCheck className="sidebar-icon" />
          <span>Leave Form</span>
        </li>
        
        <li onClick={() => handleNavigation('/AppointmentBooking')}>
          <FaCalendarCheck className="sidebar-icon" />
          <span>Appointments</span>
        </li>

        <li onClick={() => handleNavigation('/HRAdminForm')}>
          <FaCalendarCheck className="sidebar-icon" />
          <span>HR Admission</span>
          </li>
        
        <li className="logout" onClick={() => handleNavigation('/')}>
          <FaRightFromBracket className="sidebar-icon" />
          <span>Log out</span>
        </li>
      </ul>
    </div>
  );
}

export default AdminSidebar;