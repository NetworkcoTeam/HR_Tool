import {Link} from 'react-router-dom';
import './Navbar.css';
import LoginForm from './LoginForm';

function Navbar(){
    return(
    <div className="Navbar">
         <Link to="/" className="navbar-logo">
              ATLASHR
            </Link>
            <LoginForm/>
      
    </div>
    )
}
export default Navbar;