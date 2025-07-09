import {Link} from 'react-router-dom';
import './Navbar.css';
import LoginForm from './LoginForm';

function Navbar(){
    return(
    <div className="Navbar">
         <Link to="/" className="navbar-logo">
              ATLASHR
            </Link>
            <div className="Login-container">
            <LoginForm/>
            </div>
      
    </div>
    )
}
export default Navbar;