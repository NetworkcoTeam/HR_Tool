import React from 'react';
import PayslipGenerator from '../Components/PayslipGenerator';



import 'antd/dist/reset.css'; // or 'antd/dist/antd.css' for older versions

// Simple test page to mount the PayslipGenerator component
const TestPayslipPage = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Payslip Generator Test Page</h1>
      <PayslipGenerator />
    </div>
  );
};

export default TestPayslipPage;