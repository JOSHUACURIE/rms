import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role) => {
    const roles = {
      dos: 'Director of Studies',
      teacher: 'Teacher',
      principal: 'Principal'
    };
    return roles[role] || role;
  };

  const getUserName = () => {
    if (user?.fullname) return user.fullname;
    if (user?.name) return user.name;
    return 'User';
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-title">
          <h1>Dashboard</h1>
        </div>

        <div className="navbar-user">
          {user && (
            <div className="user-info">
              <div className="user-details">
                <span className="user-name">{getUserName()}</span>
                <span className="user-role">
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
                aria-label="Logout"
              >
                Logout
                <FaSignOutAlt />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;