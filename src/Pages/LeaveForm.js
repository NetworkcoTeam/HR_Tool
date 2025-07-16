import './LeaveForm.css';
import Sidebar from '../Components/Sidebar';
import React, {useState} from 'react';

function Leave(){

    const[formData, setFormData]= useState({
        name :'',
        surname : '',
        employeeID :'',
        department : '',
        position : '',
        leaveType :'',
        startDate : '',
        endDate :'',
        totalDays:'',
        doctorletter: '',
        funeralLetter:''

    })

    const handleChange =(e) =>{
      setFormData({...formData, [e.target.name]: e.target.value})
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
    }
    try{
        const response = await fetch('http://localhost:5143/api/leaveform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          employeeID: formData.employeeID,
          department: formData.department,
          position: formData.position,
          leaveType : formData.leaveType,
          startDate : formData.startDate,
          endDate : formData.endDate,
          totalDays: formData.totalDays,
          doctorletter: formData.doctorletter,
          funeralLetter: formData.funeralLetter
        }),
      });


         if (response.ok) {
        console.log('leave application successful!');
        // Optional: Redirect or show success message
      } else {
        console.error('application failed.');
        // Handle errors — maybe show a message
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

    

return(
    <>
<div className="LeaveForm">
    
<div className="sidebar"> <Sidebar/></div>
   
    <form className="form-area" onSubmit={handleSubmit}>
        <div className='form-division'>

    <h1>Leave application</h1> 

    <div className='left-form'>
    <label>Name</label><br/>
    <input type="text" name='name'/><br/><br/>
    <label>Employee ID</label> <br/>
    <input type="text" name='employeeId'/><br/>
    <label>Position</label><br/>
    <input type="text" name='position'/><br/>
    <label>Leave start</label><br/>
    <input type="date" name='startDay'/><br/>
    <label>Leave end</label><br/>
    <input type="date" name='endDay'/><br/>
    <label>Total days</label>
    <input type="text" name='totalDays'/>

    </div>

    <div className='right-form'>
    <label>Surname</label><br/>
    <input type="text"/><br/>
    <label>Department</label> <br/>
    <input type="text"/><br/>
   
  
    <label>Type of Leave</label><br/>
    <input type="radio" value='Martenity' className="Martenity"/><label>Unpaid</label><br/>
    <input type="radio" value='Martenity' className="Martenity"/><label>Maternity</label><br/>
     <input type="radio" value='Paternity' className="Martenity"/><label>Paternity</label><br/>
      <input type="radio" value='Sick' className="Martenity"/><label>Sick</label><br/>
       <input type="radio" value='Vacation' className="Martenity"/><label>Annual</label><br/>
       <input type="radio" value='Martenity' className="Martenity"/><br/><label>Family responsibility</label><br/>
        <input type="radio" value='other' className="Martenity"/><label>Other</label><br/>
        

    <label>If you chose other specify</label><br/>
    <input type="text" required/>
     </div>
       </div>
      <h1>Supporting documents</h1>
      <label>Doctor's letter</label>
      <input type='file' className='' /><br/>
      <label>Funeral letter</label>
      <input type='file' className='' /><br/>
      

    <button>Apply </button>
    
    </form>
    </div>
    
    </>
)
}

export default Leave;