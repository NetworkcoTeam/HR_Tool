import React, { useState } from 'react';
import './RegisterForm.css';

const RegisterForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    role: '',
    IdNumber: '',
    startDate: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5143/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          role: formData.role,
          IdNumber: formData.IdNumber,
          startDate: formData.startDate,
          password: formData.password
        }),
      });

      if (response.ok) {
        console.log('User registered successfully!');
        alert('You have successfully registered!');
        
        
      } else {
        console.error('Registration failed.');
        alert('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
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
                    <label className="input-label">Name</label>
                    <div className="input-wrapper">
                      <span className="input-icon user-icon"></span>
                      <input
                        type="text"
                        name="name"
                        className="form-input"
                        placeholder=""
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Surname</label>
                    <div className="input-wrapper">
                      <span className="input-icon user-icon"></span>
                      <input
                        type="text"
                        name="surname"
                        className="form-input"
                        placeholder=""
                        value={formData.surname}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

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
                    <label className="input-label">Role</label>
                    <div className="input-wrapper">
                      <span className="input-icon role-icon"></span>
                      <select
                        name="role"
                        className="form-input"
                        value={formData.role}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select a role</option>
                        <option value="admin">Admin</option>
                        <option value="employee">Employee</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="input-label">ID Number</label>
                    <div className="input-wrapper">
                      <span className="input-icon id-icon"></span>
                      <input
                        type="text"
                        name="IdNumber"
                        className="form-input"
                        placeholder=""
                        value={formData.IdNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="input-label">Start Date</label>
                    <div className="input-wrapper">
                      <span className="input-icon date-icon"></span>
                      <input
                        type="date"
                        name="startDate"
                        className="form-input"
                        value={formData.startDate}
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