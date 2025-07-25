import './Sidebar.css';
import { useNavigate } from 'react-router-dom';
import { FaHouse, FaUser, FaFileInvoiceDollar, FaFolder, FaCalendarCheck, FaRightFromBracket } from 'react-icons/fa6';

function Sidebar() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar">
      <h1 className='logo'>ATLASHR</h1>
      <ul className="sidebar-menu">
        <li onClick={() => handleNavigation('/home')}>
          <FaHouse className="sidebar-icon" />
          <span>Home</span>
        </li>
        
        <li onClick={() => handleNavigation('/profile')}>
          <FaUser className="sidebar-icon" />
          <span>Profile</span>
        </li>
        
        <li onClick={() => handleNavigation('/payslip')}>
          <FaFileInvoiceDollar className="sidebar-icon" />
          <span>Payslip</span>
        </li>
        
        <li onClick={() => handleNavigation('/documents')}>
          <FaFolder className="sidebar-icon" />
          <span>Documents</span>
        </li>
        
        <li onClick={() => handleNavigation('/leaveForm')}>
          <FaCalendarCheck className="sidebar-icon" />
          <span>Leave Form</span>
        </li>
        
        <li onClick={() => handleNavigation('/AppointmentBooking')}>
          <FaCalendarCheck className="sidebar-icon" />
          <span>Book Appointment</span>
        </li>
        
        <li className="logout" onClick={() => handleNavigation('/logout')}>
          <FaRightFromBracket className="sidebar-icon" />
          <span>Log out</span>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;