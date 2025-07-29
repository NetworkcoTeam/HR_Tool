import Sidebar from '../Components/Sidebar';
import './Documents.css';
import {Table, Divider, Flex} from 'antd';

 

function Documents(){ 
    const columns = [
    {
      title: 'File name',
      dataIndex: 'file',
      Key: 'file',
      
    },
    {
      title: 'view',
      dataIndex: 'view',
      key: 'view',
    },
    {
      title: 'Download',
      dataIndex: 'Download',
      key: 'download',
    }]
    
    const datasource =[{
      key:'1',
      file: 'Contract',
      view: 'view',
      Download: 'download',
    },
    {
    key:2,
      file: 'CV',
      view: 'view',
      Download:' download',
    },
    {
    key:3,
      file: 'Identity document',
      view: 'view',
      Download: 'download',
    },

   {
    key:'4',
      file: 'Qualifications',
      view: 'view',
      Download: 'download',
    }]
              
    return(
    <>

       <Sidebar />
       <div className='head'>
       <h1> Documents</h1> </div>
        <div className="table">
           <Table 
              columns={columns} 
               dataSource={datasource
               }
              
              
              
            />
            </div>
      </>
    )
}
export default Documents;