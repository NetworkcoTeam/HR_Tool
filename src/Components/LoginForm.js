import React, { useState } from 'react';
import './LoginForm.css';

const LoginPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePopup = () => setIsOpen(!isOpen);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5143/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        console.log('Login successful!');
        alert('Login successful!');
        togglePopup();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred. See console.');
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
                    />
                    <button 
                      type="button" 
                      className="show-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <button className="login-btn" onClick={handleLogin}>Login</button>

                <div className="register-link">
                  <span>If you don't have an account, register </span>
                  <a href="#">Register here!</a>
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
