import React, { useState } from 'react';

function Register({ onSuccess, onLoginClick, onAdminLogin, onOwnerLogin }) {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    address: '', 
    password: '' 
  });
  const [message, setMessage] = useState('');
  const [validated, setValidated] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    
    const formElement = e.currentTarget;
    if (formElement.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

  
    
    if (form.name.length < 20 || form.name.length > 60) {
      setMessage('Name must be between 20-60 characters');
      return;
    }
    
    if (form.address.length > 400) {
      setMessage('Address must not exceed 400 characters');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        onSuccess(data.user, data.sessionId);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage('Registration failed');
    }
    
    setValidated(true);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    if (message) setMessage('');
  };

  return (
    <div className="d-flex flex-column min-vh-100 " style={{ background: 'linear-gradient(135deg, #00a1ff 0%, #00ff8f 100%)' }}>
      <header className=" text-white shadow w-100" style={{ background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'blur(6px)' }}>
        <div className="container-fluid py-3 text-start">
          <h1 className="h3 mb-0">RateUs</h1>
        </div>
      </header>

      <main className="flex-grow-1 d-flex align-items-center py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <h1 className="text-center mb-4 display-4 text-white">Sign Up</h1>
              
              <div className="card shadow">
                <div className="card-body p-4">
                  {message && (
                    <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
                      {message}
                    </div>
                  )}
                  
                  <form noValidate validated={validated} onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        placeholder="Enter your Name (20-60 characters)"
                        value={form.name}
                        onChange={handleChange}
                        minLength="20"
                        maxLength="60"
                        required
                      />
                      <div className="form-text">
                        {form.name.length}/60 characters
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        placeholder="Enter your Email"
                        value={form.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        id="address"
                        name="address"
                        placeholder="Enter your Address (max 400 characters)"
                        value={form.address}
                        onChange={handleChange}
                        rows="3"
                        maxLength="400"
                        required
                      />
                      <div className="form-text">
                        {form.address.length}/400 characters
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        placeholder="Set Password (8-16 characters)"
                        value={form.password}
                        onChange={handleChange}
                        minLength="8"
                        maxLength="16"
                        required
                      />
                      <div className="form-text">
                        8-16 characters with at least one uppercase, one lowercase, and one special character
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg w-100"
                    >
                      Register
                    </button>
                  </form>
                  
                  <div className="text-center mt-4 pt-3 border-top">
                    <p className="mb-2 text-muted">Already a user?</p>
                    <button 
                      className="btn btn-link p-0" 
                      onClick={onLoginClick}
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-dark text-white py-3 mt-auto w-100">
        <div className="container-fluid">
          <div className="footer-links">
            <button 
              className="btn btn-link text-white p-0 text-decoration-none me-4"
              onClick={onAdminLogin}
            >
              Admin Login
            </button>
            <button 
              className="btn btn-link text-white p-0 text-decoration-none"
              onClick={onOwnerLogin}
            >
              Store Owner Login
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Register;