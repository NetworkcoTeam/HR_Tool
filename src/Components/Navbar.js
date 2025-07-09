import {Link} from 'react-router-dom';
import './Navbar.css';

function Navbar(){
    return(
    <div className="Navbar">
         <Link to="/" className="navbar-logo">
              ATLASHR
            </Link>
        <ul><li>
            <Link to='/Login'>Login</Link>
            </li>
            </ul>
    </div>
    )
}
export default Navbar;