import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  // State to track logged-in user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Listen for login/logout changes
  useEffect(() => {
    const handleAuthChange = () => {
      try {
        const stored = localStorage.getItem('user');
        setCurrentUser(stored ? JSON.parse(stored) : null);
      } catch {
        setCurrentUser(null);
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  // Handle Logout: removes token and user data from localStorage
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('authChange'));
    window.location.href = '/login';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🎓 Student Management System
        </Link>
        <ul className="navbar-links">
          <li>
            <Link
              to="/"
              className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/view-students"
              className={
                location.pathname === '/view-students' || location.pathname === '/all-students'
                  ? 'nav-link active'
                  : 'nav-link'
              }
            >
              View Students
            </Link>
          </li>
          {/* Add Student is restricted to Admins */}
          {currentUser?.role === 'admin' && (
            <li>
              <Link
                to="/students"
                className={location.pathname === '/students' ? 'nav-link active' : 'nav-link'}
              >
                Add Student
              </Link>
            </li>
          )}

          {/* Conditional rendering based on authentication state */}
          {currentUser ? (
            <li className="nav-auth-user">
              <span className="user-greeting">
                👋 {currentUser.name}{' '}
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    backgroundColor: currentUser.role === 'admin' ? '#fef3c7' : '#e0e7ff',
                    color: currentUser.role === 'admin' ? '#92400e' : '#3730a3'
                  }}
                >
                  {currentUser.role || 'user'}
                </span>
              </span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </li>

          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className={location.pathname === '/login' ? 'nav-link active' : 'nav-link'}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className={location.pathname === '/register' ? 'nav-link active' : 'nav-link'}
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
