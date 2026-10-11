import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="page-container">
      <div className="card dashboard-card">
        <header className="dashboard-header">
          <h1>Student Management System</h1>
          <p className="dashboard-subtitle">Manage student records with ease.</p>
        </header>

        <section className="dashboard-welcome">
          <h2>Welcome to the Dashboard</h2>
          <p className="welcome-subtitle">
            Manage student information and academic records in one place.
          </p>
          <div className="dashboard-actions">
            <Link to="/view-students" className="btn btn-primary">
              📋 View All Students
            </Link>
            {(() => {
              try {
                const user = JSON.parse(localStorage.getItem('user'));
                if (user?.role === 'admin') {
                  return (
                    <Link to="/students" className="btn btn-secondary">
                      ➕ Add New Student
                    </Link>
                  );
                }
              } catch {
                return null;
              }
              return null;
            })()}
          </div>
        </section>

      </div>
    </div>
  );
}

export default Dashboard;
