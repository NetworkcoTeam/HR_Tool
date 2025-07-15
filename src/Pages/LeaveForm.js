import './LeaveForm.css';
import Sidebar from '../Components/Sidebar';

function Leave(){
return(
<div className="LeaveForm">
<div className="sidebar"> <Sidebar/> </div>
    <form className=" ">
    <label>Name</label>
    <input type="text" />
    <label>Surname</label>
    <input type="text" />
    <label>Employee ID</label>
    <input type="text" />
    <label>Position</label>
    <input type="text" />
    <label>Reason for Leave</label>
    <input type="radio" value='Martenity' className="Martenity"/>
     <input type="radio" value='Paternity' className="Martenity"/>
      <input type="radio" value='Sick' className="Martenity"/>
       <input type="radio" value='Vacation' className="Martenity"/>
        <input type="radio" value='other' className="Martenity"/>
        

    <label>If you chose other specify</label>
    <input type="text" required/>

    <label>Leave start</label>
    <input type="text" />
    <label>Leave end</label>
    <input type="text" />

    <button>Apply </button>
    </form>
    </div>
    
)
}

export default Leave;