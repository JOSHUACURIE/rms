import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const logo="/logo.png"
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Valid roles in the system
  const VALID_ROLES = ['dos', 'principal', 'teacher'];

  
  const normalizeRole = (role) => {
    if (!role) return null;
    
    const normalizedRole = role.toLowerCase().trim();
    return VALID_ROLES.includes(normalizedRole) ? normalizedRole : null;
  };

  // Extract and validate user role from response
  const extractUserRole = (userData) => {
    // Priority 1: Check role field (new schema)
    if (userData.role) {
      return normalizeRole(userData.role);
    }

    
    if (userData.roles) {
      if (Array.isArray(userData.roles) && userData.roles.length > 0) {
        return normalizeRole(userData.roles[0]);
      }
      if (typeof userData.roles === 'string') {
        return normalizeRole(userData.roles);
      }
    }

    // Priority 3: Check teacher profile
    if (userData.teacher && userData.teacher.teacher_id) {
      return 'teacher';
    }

    return null;
  };

  // Validate user data structure
  const validateUserData = (userData) => {
    if (!userData) {
      throw new Error('No user data received');
    }

    const requiredFields = ['user_id', 'email'];
    const missingFields = requiredFields.filter(field => !userData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Invalid user data: missing required fields (${missingFields.join(', ')})`);
    }

    const userRole = extractUserRole(userData);
    if (!userRole) {
      throw new Error('No valid role assigned to this account');
    }

    return {
      user_id: userData.user_id,
      email: userData.email,
      role: userRole,
      fullname: userData.fullname || userData.full_name || '',
      teacher_id: userData.teacher_id || (userData.teacher ? userData.teacher.teacher_id : null)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    try {
      const result = await authApi.login({ 
        email: email.toLowerCase().trim(), 
        password: password.trim() 
      });

      const { user: userData, token } = result;

      if (!userData || !token) {
        throw new Error('Invalid response from server: missing user data or token');
      }

     
      const validatedUserData = validateUserData(userData);

      login(validatedUserData, token);

      // Redirect based on role
      const from = location.state?.from?.pathname || getDashboardPath(validatedUserData.role);
      navigate(from, { replace: true });

    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.includes?.('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDashboardPath = (userRole) => {
    switch (userRole) {
      case 'dos':
        return '/dos/dashboard';
      case 'principal':
        return '/principal/dashboard';
      case 'teacher':
        return '/teacher/submit-scores';
      default:
        return '/login';
    }
  };

  return (
    <div className="glass-container">
      
      <div className="bubbles">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="bubble" style={{
            '--i': i,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`
          }}></div>
        ))}
      </div>

    
      <div className="glass-card">
        <div className="card-inner">
        
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-icon"><img src={logo}/></div>
              <div className="logo-text">
                <h1 className="login-title">LeraTech</h1>
                <p className="login-subtitle">Academic Management System</p>
              </div>
            </div>
          </div>

     
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-glass">
                <span className="error-icon">⚠️</span>
                <span className="error-text">{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="input-glass-group">
              <label htmlFor="email" className="input-glass-label">
                <span className="label-icon">📧</span>
                <span>Email Address</span>
              </label>
              <div className={`input-glass-wrapper ${isEmailFocused ? 'focused' : ''} ${email ? 'has-value' : ''}`}>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  required
                  placeholder="name@school.edu"
                  autoComplete="email"
                  className="input-glass-field"
                />
                <div className="input-glass-highlight"></div>
              </div>
            </div>

          
            <div className="input-glass-group">
              <label htmlFor="password" className="input-glass-label">
                <span className="label-icon">🔒</span>
                <span>Password</span>
              </label>
              <div className={`input-glass-wrapper ${isPasswordFocused ? 'focused' : ''} ${password ? 'has-value' : ''}`}>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-glass-field"
                />
                <div className="input-glass-highlight"></div>
              </div>
            </div>

    
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className={`glass-submit-btn ${loading ? 'loading' : ''}`}
            >
              <span className="btn-content">
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span className="btn-icon">→</span>
                    <span>Sign In</span>
                  </>
                )}
              </span>
              <div className="btn-glow"></div>
            </button>

      
          </form>

        </div>
      </div>
    </div>
  );
};

export default Login;