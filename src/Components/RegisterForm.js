import React, { useState } from 'react';
import './RegisterForm.css';

const RegisterForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registration data:', formData);
    // Add your registration logic here
  };

  return (
    <div className="registration-component">
      <button className="register-trigger" onClick={togglePopup}>
        Register
      </button>

      {isOpen && (
        <div className="popup-backdrop" onClick={togglePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={togglePopup}>
              ×
            </button>
            
            <div className="registration-container">
              <div className="registration-form">
                <h2 className="form-title">Sign Up</h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="input-label">Email</label>
                    <div className="input-wrapper">
                      <span className="input-icon email-icon"></span>
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        placeholder=""
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Username</label>
                    <div className="input-wrapper">
                      <span className="input-icon user-icon"></span>
                      <input
                        type="text"
                        name="username"
                        className="form-input"
                        placeholder=""
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Password</label>
                    <div className="input-wrapper">
                      <span className="input-icon password-icon"></span>
                      <input
                        type="password"
                        name="password"
                        className="form-input"
                        placeholder=""
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button 
                        type="button" 
                        className="show-password-btn"
                        onClick={() => {
                          const input = document.querySelector('input[name="password"]');
                          input.type = input.type === 'password' ? 'text' : 'password';
                        }}
                      >
                        <span className="visibility-icon"></span>
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Confirm Password</label>
                    <div className="input-wrapper">
                      <span className="input-icon password-icon"></span>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-input"
                        placeholder=""
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                      <button 
                        type="button" 
                        className="show-password-btn"
                        onClick={() => {
                          const input = document.querySelector('input[name="confirmPassword"]');
                          input.type = input.type === 'password' ? 'text' : 'password';
                        }}
                      >
                        <span className="visibility-icon"></span>
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="register-btn">
                    Register
                  </button>
                </form>

                <div className="login-prompt">
                  Already have an account? 
                  <a href="#" className="login-link">Login here!</a>
                </div>
              </div>

              <div className="side-panel">
                <div className="panel-image">
                    <img src="/images/2836040.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;