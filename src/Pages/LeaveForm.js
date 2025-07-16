import './LeaveForm.css';
import Sidebar from '../Components/Sidebar';

function Leave(){
return(
    <>
<div className="LeaveForm">
    
<div className="sidebar"> <Sidebar/></div>
   <h1>Leave application</h1> 
    <form className="form-area">
        <div className='form-division'>

    <h1>Leave application</h1> 

    <div className='left-form'>
    <label>Name</label><br/>
    <input type="text"/>
    <label>Employee ID</label> <br/>
    <input type="text"/><br/>
    <label>Position</label><br/>
    <input type="text"/><br/>
    <label>Leave start</label>
    <input type="text"/>
    <label>Leave end</label>
    <input type="text"/>
    <label>Total days</label>
    <input type="text"/>

    </div>

    <div className='right-form'>
    <label>Surname</label><br/>
    <input type="text"/><br/>
    <label>Department</label> <br/>
    <input type="text"/><br/>
   
  
    <label>Type of Leave</label>
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

      <h1>Supporting documents</h1>
      <label>Doctor's letter</label>
      <input type='file' className='' />
      <label>Funeral letter</label>
      <input type='file' className='' />
      

    <button>Apply </button>
    </div>
    </form>
    </div>
    
    </>
)
}

export default Leave;