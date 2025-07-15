import {  Route, Routes } from 'react-router-dom';
import Navbar from './Components/Navbar'; 
import './App.css';
import Home from './Pages/Home';
import Landing from './Pages/Landing';

function App() {
  return (
    
    

     
     <>
          <Navbar />
      <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home />} />
          {/* Add more routes as needed */}
      </Routes>
         
     </>
  
    
  
      
      
      
       
       
       
   
  );
}

export default App;
