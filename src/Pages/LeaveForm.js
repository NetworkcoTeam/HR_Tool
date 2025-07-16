import './LeaveForm.css';
import Sidebar from '../Components/Sidebar';
import '../Components/Sidebar.css';
import React,{useState} from 'react';


function Leave(){
    const [selectedOption, setSelectedOption] = useState('');
    const [reason, setReason]= useState('');
    const handleChange=(e) =>{ setSelectedOption(e.target.value);
        if(e.target.value !=='other'){
        setReason('');
    }}
    
return(
    <>
<div className="LeaveForm">
    
<div className="sidebar"> <Sidebar/></div>
   
    <form className="form-area">
        <h1 className='heading'>Leave application</h1>
        <div className='form-division'>

    

    <div className='left-form'>
    <label>Name</label><br/>
    <input type="text"/><br/><br/>
    <label>Employee ID</label> <br/>
    <input type="text"/><br/><br/>
    <label>Position</label><br/>
    <input type="text"/><br/><br/>
    <label>Leave start</label><br/>
    <input type="date"/><br/><br/>
    <label>Leave end</label><br/>
    <input type="date"/><br/><br/>
    <label>Total days</label>
    <input type="text"/>

    </div>

    <div className='right-form'>
    <label>Surname</label><br/>
    <input type="text"/><br/><br/>
    <label>Department</label> <br/>
    <input type="text"/><br/><br/>
   
  
    <label>Type of Leave</label><br/>
    <input type="radio" value='Unpaid' checked={selectedOption =='Unpaid'} className='leave' onChange={handleChange}/><label>Unpaid</label><br/>
    <input type="radio" value='Martenity' checked={selectedOption =='Martenity'} className="leave" onChange={handleChange}/><label>Maternity</label><br/>
     <input type="radio" value='Paternity' checked={selectedOption =='Paternity'} className="leave" onChange={handleChange}/><label>Paternity</label><br/>
      <input type="radio" value='Sick' checked={selectedOption =='Sick'} className="leave" onChange={handleChange}/><label>Sick</label><br/>
       <input type="radio" value='Vacation' checked={selectedOption =='Annual'} className="leave" onChange={handleChange}/><label>Annual</label><br/>
       <input type="radio" value='Martenity' checked={selectedOption =='Family responsibility'}className="leave"onChange={handleChange}/><br/><label>Family responsibility</label><br/>
        <input type="radio" value='other' checked={selectedOption =='other'} className="leave"onChange={handleChange}/><label>Other</label><br/>
        
       
       {selectedOption =='other' && (<div style={{marginTop:'10px'}}>
        <label>If you chose other specify <input type="text" value={reason} 
        onChange={(e)=> setReason(e.target.value)}
        /></label>)}
     </div>
     
    </div>

      <h1>Supporting documents</h1>
      <label>Doctor's letter</label>
       <label className="upload-btn">Choose file</label>
      <input type='file' className='upload' /> <button>upload</button><br/>
      <label>Funeral letter</label>
      <input type='file' className='upload' /><button>upload</button><br/>
      

    <button>Apply </button>
    
    </form>
    </div>
    
    </>
)
}

export default Leave;