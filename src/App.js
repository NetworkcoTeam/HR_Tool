

import Home from './Pages/Home';
import LeaveForm from './Pages/LeaveForm';
import{Routes,Route} from 'react-router-dom';
import LandingLayout from './Components/LandingLayout';
import HomeLayout from './Components/HomeLayout';

import HRAdminForm from './Components/HRAdminForm';

import './App.css';
import Landing from './Pages/Landing';
import Admin from './Pages/Admin';
import LeaveManagement from './Pages/LeaveManagement';
import PayslipManagement from './Pages/PayslipManagement';
import DocumentsPage from './Pages/DocumentsPage';
import AppointmentBooking from './Pages/AppointmentBooking';
import Profile from './Pages/Profile';

import Logout from './Components/Logout';

function App() {
  return (
    
 
      <Routes>
        <Route path="/" element={<LandingLayout />}>
         <Route index element={<Landing />}/> </Route>

        <Route path="/home" element={<HomeLayout />}>
        <Route path="/home" element={<Home />}/> </Route>
        <Route path="/Profile" element={<Profile/>}/>

        <Route path="/leaveForm" element={<LeaveForm/>}/>
        <Route path="/Admin" element={<Admin/>}/>
        <Route path="/LeaveManagement" element={<LeaveManagement/>}/>
        <Route path="/PayslipManagement" element={<PayslipManagement/>}/>

        <Route path="/AppointmentBooking" element={<AppointmentBooking/>}/>

        <Route path="/HRAdminForm" element={<HRAdminForm/>}/>
         <Route path="/Documents" element={<DocumentsPage/>}/>

         <Route path="/logout" element={<Logout />} />
      </Routes>
      
       
       
       
   
  );
}

export default App;
