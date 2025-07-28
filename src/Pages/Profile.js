import { DiVim } from 'react-icons/di';
import Sidebar from '../Components/Sidebar';
import './Profile.css';
import { UserOutlined } from '@ant-design/icons';
import {Avatar ,Space, Divider, Flex} from 'antd';

export default function Profile(){
return(
    <>
    <Sidebar />            
    <div className='Profile'>
    
        
        
         <div className='Avatar'>
        <Space gap='small'>
            
        <Avatar size={90} icon={<UserOutlined/> } className='avatar'/><br/>
        <h1>Dimpho Setsile</h1>
        </Space>
        </div>
        
        <div className='personal-details'>
        <div className="left" >
        <label className='Name'> Name:</label><br/>
         <label className='surname'>Surname:</label><br/>
         
         
         
           <label className='email'>email address:</label><br/>
           <label className='dob'>date of birth:</label>
          </div>
          
          

          <div gap='middle' horizontal className='right'>
           <label className='employeeid'>employee ID :</label><br/><br/>
           <label className='position'>Position :</label><br/><br/>
           
               
           
            <label className='department'>Department:</label><br/><br/>
             <label className='status'>Status Leave:</label><br/><br/>
            
             </div>
             </div>

    </div>
    </>
)

}


