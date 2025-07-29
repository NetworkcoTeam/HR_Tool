import Sidebar from '../Components/Sidebar';
import './Profile.css';
import { UserOutlined } from '@ant-design/icons';
import {Avatar ,Space, Divider, Flex} from 'antd';

export default function Profile(){
return(
    <>
    <Sidebar />            
    <div className='Profile-body'>
    <div className='Profile'>
    
        
        
         <div className='Avatar'>
          <div className='background-avatar'>
        <Space gap='small'>
            
        <Avatar size={190} icon={<UserOutlined/> } className='avatar'/><br/>
        
        </Space>
        
        <Divider/>
        <div>
        <h1 style={{marginTop:'12'}}>Dimpho Setsile</h1>
        </div>
        </div>
        </div>
        
        <div className='personal-details'>
        <div className="left" >
           <label className='Profile-labels'>email address:</label><br/><br/>
           <label className='Profile-labels'>date of birth</label><br/><br/>
            <label className='Profile-labels'>Started working</label><br/>
          </div>
          
          

          <div gap='middle' horizontal className='right'>
           <label className='Profile-labels'>employee ID </label><br/><br/>
           <label className='Profile-labels'>Position </label><br/><br/>
            <label className='Profile-labels'>Department</label><br/><br/>
            
            
             </div>
             </div>

    </div>
    </div>
    </>
)

}


