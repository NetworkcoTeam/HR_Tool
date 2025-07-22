
import Sidebar from '../Components/Sidebar'; 
import ViewLeaveApplication from '../Components/ViewLeaveApplication.js'; 
import LeaveForm from '../Components/LeaveForm';
import './ViewLeave.css'
import React, {useState } from 'react';
import {  Button } from 'antd';



function ViewLeavePage(){
  const [showLeaveForm, setShowLeaveForm] = useState(true);

   const handleClick  = () => {
    if (showLeaveForm == false){
      setShowLeaveForm(true);
    }else{
      setShowLeaveForm(false);
    }
    }
   
 

  return (
    <div className="ViewLeave-container">
          <Sidebar />

          
          <div className="viewLeave-main">
            <Button  onClick={handleClick}>
          
              View application form </Button>
            {showLeaveForm && <LeaveForm /> }

            <div className="view-leave">
            <ViewLeaveApplication /> 
            </div>
            
            
          </div>
        </div>
  );
};

export default ViewLeavePage;