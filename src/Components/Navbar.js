import {Link} from 'react-router-dom';
import './Navbar.css';


function Navbar(){
    return(
    <div className="Navbar">
         <Link to="/" className="navbar-logo">
              ATLASHR
            </Link>
            
      
    </div>
    )
}
export default Navbar;