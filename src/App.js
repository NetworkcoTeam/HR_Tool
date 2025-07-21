

import Home from './Pages/Home';
import LeaveForm from './Pages/LeaveForm';
import{Routes,Route} from 'react-router-dom';
import LandingLayout from './Components/LandingLayout';
import HomeLayout from './Components/HomeLayout';
import './App.css';
import Landing from './Pages/Landing';
import Admin from './Pages/Admin';
import LeaveManagement from './Pages/LeaveManagement';
import PayslipManagement from './Pages/PayslipManagement';

function App() {
  return (
    
 
      <Routes>
        <Route path="/" element={<LandingLayout />}>
         <Route index element={<Landing />}/> </Route>

        <Route path="/home" element={<HomeLayout />}>
        <Route path="/home" element={<Home />}/> </Route>

        <Route path="/leaveForm" element={<LeaveForm/>}/>
        <Route path="/Admin" element={<Admin/>}/>
        <Route path="/LeaveManagement" element={<LeaveManagement/>}/>
        <Route path="/PayslipManagement" element={<PayslipManagement/>}/>
      </Routes>
      
       
       
       
   
  );
}

export default App;
