import Sidebar from '../Components/Sidebar';
import './Profile.css';
import { UserOutlined } from '@ant-design/icons';
import {Avatar ,Space, Divider, Flex} from 'antd';

export default function Profile(){
return(
    <>
    <Sidebar />
    <div className='Profile'>
        <h5>Personal details</h5>
        
        <Divider></Divider>
        
        <Space gap='small'>
        <Avatar size={90} icon={<UserOutlined/> } className='avatar'/>
        </Space>
        <div className='personal-details'>
        <Flex horizontal gap='middle' >
        <label className='Name'> Name:</label>
         <label className='surname'>Surname:</label>
         </Flex>

         <Flex horizontal gap='middle' className='Personal-details-second'>
           <label className='email'>email address:</label>
           <label className='dob'>date of birth:</label>
          </Flex>
          </div>
          
          <Divider/>
          <h5 className='header-job'>JOB DETAILS</h5>
          <Divider />

          <Flex gap='middle' horizontal className='job-details'>
           <label className='employeeid'>employee ID :</label><br/><br/>
           <label className='position'>Position :</label><br/><br/>
           </Flex>
               
           <Flex horizontal className='job-details-second'>
            <label className='department'>Department:</label><br/><br/>
             <label className='status'>Status Leave:</label><br/><br/>
            
             </Flex> 

    </div>
    </>
)

}


