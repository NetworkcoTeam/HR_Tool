import React, { useState } from 'react';
import './LoginForm.css';

const LoginPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const togglePopup = () => setIsOpen(!isOpen);

  return (
    <div className="app-container">
      {/* This would be your main page content */}
      <button onClick={togglePopup} className="login-trigger">
        Login
      </button>

      {/* Popup Backdrop */}
      {isOpen && (
        <div className="popup-backdrop" onClick={togglePopup}>
          {/* Popup Content - stops propagation so clicking inside doesn't close */}
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={togglePopup}>×</button>
            
            {/* Your Login Form with Blue Side Panel on RIGHT */}
            <div className="login-container">
              {/* Login form on LEFT */}
              <div className="login-form">
                <h1 className="form-title">Log in</h1>
                
                {/* Email Input */}
                <div className="form-group">
                  <label className="input-label">Email</label>
                  <div className="input-wrapper">
                    <div className="input-icon"></div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="form-input"
                    />
                  </div>
                  <div className="underline"></div>
                </div>

                {/* Password Input */}
                <div className="form-group">
                  <label className="input-label">Password</label>
                  <div className="input-wrapper">
                    <div className="input-icon"></div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your Password"
                      className="form-input"
                    />
                    <button 
                      type="button" 
                      className="show-password-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? '' : ''}
                    </button>
                  </div>
                  <div className="underline"></div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="form-options">
                  <div className="remember-me">
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">Remember me</label>
                  </div>
                  <a href="#" className="forgot-password">Forgot Password?</a>
                </div>

                {/* Login Button */}
                <button className="login-btn">Login</button>

                
                {/* Register Link */}
                <div className="register-link">
                  <span>If you don't have an account register </span>
                  
                </div>
              </div>

              {/* Blue side panel on RIGHT */}
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