import Sidebar from '../Components/Sidebar';
import './Profile.css';
import { UserOutlined } from '@ant-design/icons';
import {Avatar ,Space, Divider, Flex} from 'antd';
import React, { useState, useEffect } from 'react';


export default function Profile(){
    const [userDetails, setUserDetails] = useState({});
    useEffect(() => {
        const storedUserDetails = localStorage.getItem('user');
        if (storedUserDetails) {
            setUserDetails(JSON.parse(storedUserDetails));
        }
    }, []);
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
        <label className='Name'><strong>Name:</strong> {userDetails.name}</label>
                        <label className='surname'><strong>Surname:</strong> {userDetails.surname}</label>
         </Flex>

         <Flex horizontal gap='middle' className='Personal-details-second'>
         <label className='email'><strong>Email Address:</strong> {userDetails.email}</label>
         <label className='ID'><strong>ID Number:</strong> {userDetails.idNumber}</label>
          </Flex>
          </div>
          
          <Divider/>
          <h5 className='header-job'>JOB DETAILS</h5>
          <Divider />

          <Flex gap='middle' horizontal className='job-details'>
          <label className='EmployeeID'><strong>Employee Number:</strong> {userDetails.employee_id}</label>

           </Flex>
               
           <Flex horizontal className='job-details-second'>
           <label className='role'><strong>Role:</strong> {userDetails.role}</label>
            
             </Flex> 

    </div>
    </>
)

}
