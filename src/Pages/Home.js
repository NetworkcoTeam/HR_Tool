import './Home.css';
import Sidebar from '../Components/Sidebar';

function home(){
    return(
        <div className="Home-container">
        <div className="sideBar">
            <Sidebar />
        </div>
        <div className="dashboard">
       
         <div className="first-grid">
            <div className="Todo-List">
                <h1> TO DO LIST</h1> 
                   <div className="Todo-list-container">
                    <div className="Details"></div>
                    <div className="time"></div>
                    </div>
                    <button>Add to list</button>

            </div>

            <div className="Payslips">
                <h1> PAYSLIPS</h1> 
                   <div className="Payslips-container">
                    <div className="month"></div>
                    <div className="Payslip-btns"></div>
                    </div>
            </div>



         </div>
         <div className="second-grid">
            <div className="Leave">
                <h1> LEAVE</h1> 
                   <div className="leave-container">
                    <div className="Details"></div>
                    <div className="time"></div>
                    </div>

             </div>

                 <div className="Appointments">
                    <h1> APPOINTMENTS</h1> <h1>10 July 2025</h1>
                   <div className="appointment-container">
                    <div className="Details"></div>
                    <div className="time"></div>
                    </div>

                    </div>
                    
         </div>

        </div>
        </div>
    )
}
export default home;
