import Sidebar from '../Components/Sidebar';
import './Documents.css';

function Documents(){
    return(
     <div className='Documents-container'>
        <Sidebar />
        <h1>Documents</h1>
        <div className='Document-container'>
            <div className='file-container'>
            <label>Contract </label>

            <div className='btns'>
            <button>view</button>
            <button>Download</button>
            </div>
             </div>

            <div className='file-container'>
            <label> CV</label>
              <div className='btns'>
            <button>view</button>
            <button>Download</button>
             </div>
            </div>

             <div className='file-container'>
            <label>Identity document </label>
              <div className='btns'></div>
             <button>view</button>
            <button>Download</button>
             </div>
            </div>

            <div className='file-container'>
            <label> Qualifications </label>
              <div className='btns'>
             <button>view</button>
            <button>Download</button>
            </div>
        </div>

      </div>
    )
}
export default Documents;