import {Outlet} from 'react-router-dom';
import Navbar from './Navbar';

 function LandingLayout(){
    return(
        <>
        <Navbar />
        
        <Outlet />
        </>
    )
}
export default LandingLayout;