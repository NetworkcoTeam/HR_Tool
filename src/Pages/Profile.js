import { DiVim } from 'react-icons/di';
import Sidebar from '../Components/Sidebar';
import './Profile.css';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import {Avatar ,Space, Divider, Flex} from 'antd';

export default function Profile(){
return(
    <>
    <Sidebar />            
    <div className='Profile'>
    
        
        
         <div className='Avatar'>
          <div className='background-avatar'>
        <Space gap='small'>
            
        <Avatar size={190} icon={<UserOutlined/> } className='avatar'/><br/>
        
        </Space>
        
        <Divider/>
        <div>
        <h1>Dimpho Setsile</h1>
        </div>
        </div>
        </div>
        
        <div className='personal-details'>
        <div className="left" >
           <label className='a'>email address:</label><br/><br/>
           <label className='a'>date of birth</label><br/><br/>
            <label className='a'>Started working</label><br/>
          </div>
          
          

          <div gap='middle' horizontal className='right'>
           <label className='a'>employee ID </label><br/><br/>
           <label className='a'>Position </label><br/><br/>
            <label className='a'>Department</label><br/><br/>
            
            
             </div>
             </div>

    </div>
    </>
)

}


