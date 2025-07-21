import React, { useState } from 'react';
import './LoginForm.css';
import { useNavigate } from 'react-router-dom';
import { Spin, message } from 'antd';

const LoginPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePopup = () => setIsOpen(!isOpen);
const handleLogin = async (e) => {
  e.preventDefault();
  
  if (!email || !password) {
    message.error('Please enter both email and password');
    return;
  }

  setLoading(true);
  
  try {
    const response = await fetch('http://localhost:5143/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const userData = await response.json();

    if (!response.ok) {
      throw new Error(userData.message || 'Login failed');
    }

    // Store just the user data (no token)
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('Login successful:', userData);
    message.success('Login successful!');
    togglePopup();
    
    // Check user role and navigate accordingly
    if (userData.role ==='admin') {
      navigate('/admin'); 
    } else {
      navigate('/home'); 
    };

  } catch (err) {
    console.error('Login error:', err);
    message.error(err.message || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="app-container">
      <button onClick={togglePopup} className="login-trigger">
        Login
      </button>

      {isOpen && (
        <div className="popup-backdrop" onClick={togglePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={togglePopup}>×</button>

            <div className="login-container">
              <div className="login-form">
                <h1 className="form-title">Log in</h1>

                <div className="form-group">
                  <label className="input-label">Email</label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="form-input"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Password</label>
                  <div className="input-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="form-input"
                      required
                      disabled={loading}
                    />
                    <button 
                      type="button" 
                      className="show-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button 
                  className="login-btn" 
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? <Spin size="small" /> : 'Login'}
                </button>

                <div className="register-link">
                  Don't have an account? <a href="/register">Register here</a>
                </div>
              </div>

              <div className="side-panel">
                <div className="panel-image">
                  <img src="/images/2836040.png" alt="Decorative" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPopup;