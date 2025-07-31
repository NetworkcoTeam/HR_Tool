import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear user session
    localStorage.removeItem('user');
    // Redirect to login
    navigate('/#'); 
  }, [navigate]);

  return (
    <div className="logout-message">
      <h2>Logging out...</h2>
    </div>
  );
}

export default Logout;  