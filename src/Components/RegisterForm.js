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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState({
    success: null,
    message: ''
  });

  const togglePopup = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setFormData({
        name: '',
        surname: '',
        email: '',
        role: '',
        IdNumber: '',
        startDate: '',
        password: '',
        confirmPassword: ''
      });
      setRegistrationStatus({
        success: null,
        message: ''
      });
    }
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
    setIsSubmitting(true);
    setRegistrationStatus({
      success: null,
      message: ''
    });

    if (formData.password !== formData.confirmPassword) {
      setRegistrationStatus({
        success: false,
        message: 'Passwords do not match!'
      });
      setIsSubmitting(false);
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

      const data = await response.json();

      if (response.ok) {
        setRegistrationStatus({
          success: true,
          message: 'Registration successful! Please wait for HR validation.'
        });
        setFormData({
          name: '',
          surname: '',
          email: '',
          role: '',
          IdNumber: '',
          startDate: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        setRegistrationStatus({
          success: false,
          message: data.message || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setRegistrationStatus({
        success: false,
        message: 'An error occurred. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-component">
      <button className="register-trigger" onClick={togglePopup}>
        Register
      </button>

      {isOpen && (
        <div className="popup-backdrop" onClick={togglePopup}>
          <div className="popup-content compact-form" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={togglePopup}>
              ×
            </button>
            
            <div className="registration-container">
              <div className="registration-form">
                <h2 className="form-title">Sign Up</h2>
                
                {registrationStatus.message && (
                  <div className={`status-message ${registrationStatus.success ? 'success' : 'error'}`}>
                    {registrationStatus.message}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="form-group compact-group">
                    <label className="input-label compact-label">Name</label>
                    <div className="input-wrapper compact-input">
                      <span className="input-icon user-icon"></span>
                      <input
                        type="text"
                        name="name"
                        className="form-input"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group compact-group">
                    <label className="input-label compact-label">Surname</label>
                    <div className="input-wrapper compact-input">
                      <span className="input-icon user-icon"></span>
                      <input
                        type="text"
                        name="surname"
                        className="form-input"
                        value={formData.surname}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group compact-group">
                    <label className="input-label compact-label">Email</label>
                    <div className="input-wrapper compact-input">
                      <span className="input-icon email-icon"></span>
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group compact-group">
                    <label className="input-label compact-label">Role</label>
                    <div className="input-wrapper compact-input">
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

                  <div className="form-group compact-group">
                    <label className="input-label compact-label">ID Number</label>
                    <div className="input-wrapper compact-input">
                      <span className="input-icon id-icon"></span>
                      <input
                        type="text"
                        name="IdNumber"
                        className="form-input"
                        value={formData.IdNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group compact-group">
                    <label className="input-label compact-label">Start Date</label>
                    <div className="input-wrapper compact-input">
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

                  <div className="form-group compact-group">
                    <label className="input-label compact-label">Password</label>
                    <div className="input-wrapper compact-input">
                      <span className="input-icon password-icon"></span>
                      <input
                        type="password"
                        name="password"
                        className="form-input"
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

                  <div className="form-group compact-group">
                    <label className="input-label compact-label">Confirm Password</label>
                    <div className="input-wrapper compact-input">
                      <span className="input-icon password-icon"></span>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-input"
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

                  <button 
                    type="submit" 
                    className="register-btn compact-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Registering...' : 'Register'}
                  </button>
                </form>

                <div className="login-prompt compact-prompt">
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