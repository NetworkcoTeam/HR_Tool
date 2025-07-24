
import LeaveRequestsAdmin from './Components/LeaveRequestAdmin';
import Home from './Pages/Home';
import LeaveForm from './Components/LeaveForm';
import{Routes,Route} from 'react-router-dom';
import LandingLayout from './Components/LandingLayout';
import HomeLayout from './Components/HomeLayout';
import './App.css';
import Landing from './Pages/Landing';
import Admin from './Pages/Admin';
import LeaveManagement from './Pages/LeaveManagement';
import ViewLeavePage from './Pages/ViewLeave';
import PayslipPage from './Pages/PayslipManagement';
import Profile from './Pages/Profile';

function App() {
  return (
    
 
      <Routes>
        <Route path="/" element={<LandingLayout />}>
         <Route index element={<Landing />}/> </Route>

        <Route path="/home" element={<HomeLayout />}>
        <Route path="/home" element={<Home />}/> </Route>

        <Route path="/leaveForm" element={<LeaveForm/>}/>
        <Route path="/viewleave" element={<ViewLeavePage/>}/>
        <Route path="/Admin" element={<Admin/>}/>
        <Route path="/LeaveManagement" element={<LeaveManagement/>}/>
        <Route path="/PayslipManagement" element={<PayslipPage/>}/>
        <Route path="/Profile" element={<Profile/>}/>

      </Routes>
      
       
       
       
   
  );
}

export default App;
