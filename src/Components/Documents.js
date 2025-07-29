import Sidebar from '../Components/Sidebar';
import '../Pages/Documents.css';
import {Table , Spin} from 'antd';
import React ,{useState, useEffect} from 'react';

  

function Documents(){ 

     const [documents, setDocuments] = useState([]);
     const [loading, setLoading] = useState(false);
       

     const fetchDocuments = async ()=>{
     setLoading(true);
      try {
      const res = await fetch('http://localhost:5143/api');
      if (!res.ok) {
        throw new Error('Failed to fetch documents' );
      }
      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      message.error(error.message);
    } finally {
      setLoading(false);
    };
      fetchDocuments(documents);
        };




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
    }];
    
 
              
    return(
    <>

       <Sidebar />
       <div className='head'>
       <h1> Documents</h1> </div>

        <div className="table">
       <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={documents} 
          rowKey="id"
          loading={loading}
        />
      </Spin>
              
              
              
            
            </div>
      </>
    )
}
export default Documents;