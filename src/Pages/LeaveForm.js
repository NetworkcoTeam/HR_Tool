import './LeaveForm.css';
import Sidebar from '../Components/Sidebar';
import '../Components/Sidebar.css';


function Leave(){
    
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
      <div className='upload'>
      <input type='file' className='upload' /><br/></div>
      <label>Funeral letter</label>
      <input type='file' className='upload' /><br/>
      

    <button>Apply </button>
    
    </form>
    </div>
    
    </>
)
}

export default Leave;