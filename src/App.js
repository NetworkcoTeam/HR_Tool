

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
import ContractEditorPage from './Pages/ContractEditorPage';
import PayslipPage from './Pages/PayslipPage';

import Logout from './Components/Logout';
import ForgotPasswordPage from './Pages/ForgotPasswordPage';
import PasswordResetPage from './Pages/PasswordResetPage';

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
        <Route path="/PayslipPage" element={<PayslipPage/>}/>
        

        <Route path="/AppointmentBooking" element={<AppointmentBooking/>}/>

        <Route path="/HRAdminForm" element={<HRAdminForm/>}/>
        <Route path="/Documents" element={<DocumentsPage/>}/>
        <Route path="/ContractEditorPage" element={<ContractEditorPage/>}/>

         <Route path="/logout" element={<Logout />} />
        <Route path="/ForgotPassword" element={<ForgotPasswordPage/>}/>
        <Route path="/reset-password/:token" element={<PasswordResetPage/>}/>
      </Routes>
      
       
       
       
   
  );
}

export default App;
