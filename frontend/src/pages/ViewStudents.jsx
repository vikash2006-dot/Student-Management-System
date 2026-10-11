import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StudentTable from '../components/StudentTable';
import EditStudentModal from '../components/EditStudentModal';

// Beginner-friendly ViewStudents Page Component
// Allows regular users and admins to view and search students
// Supports Editing and Deleting student records
function ViewStudents() {
  const token = localStorage.getItem('token');
  const currentUser = (() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();
  const isAdmin = currentUser?.role === 'admin';

  // State management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [editingStudent, setEditingStudent] = useState(null);

  // Function to fetch students from backend with optional search filter
  const fetchStudents = async (query = searchTerm) => {
    try {
      setLoading(true);
      setErrorMessage('');

      // Send GET request to backend API (with search query parameter if provided)
      const params = {};
      if (query && query.trim()) {
        params.search = query.trim();
      }

      const response = await api.get('/students', { params });

      if (response.data && response.data.data) {
        setStudents(response.data.data);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      if (error.response?.status === 401) {
        setErrorMessage('Access denied or session expired. Please log in to view student records.');
      } else {
        const msg =
          error.response?.data?.message ||
          'Failed to connect to the server. Please ensure the backend is running.';
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Handle live search change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchStudents(value);
  };

  // Handle student deletion (Admin only)
  const handleDelete = async (id, name) => {
    if (!isAdmin) {
      alert('Access denied: Only administrators have permission to delete students.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      setStatusMessage({
        type: 'success',
        text: `Student "${name}" deleted successfully!`
      });
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        'Failed to delete student. Please try again.';
      setStatusMessage({
        type: 'error',
        text: msg
      });
    }
  };

  return (
    <div className="page-container page-container-wide">
      <div className="card">
        {/* Header section with title and quick actions */}
        <div className="page-header-row">
          <div>
            <h2>All Registered Students</h2>
            <p className="subtitle">
              View and search all registered student records in the database.
            </p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => fetchStudents(searchTerm)}
              className="btn btn-secondary"
              disabled={loading}
            >
              🔄 Refresh
            </button>
            {/* Add Student button is rendered only for Admin users or logged-in users */}
            {isAdmin && (
              <Link to="/students" className="btn btn-primary">
                + Add Student
              </Link>
            )}
          </div>
        </div>

        {/* Search bar accessible by both regular users and admins */}
        <div style={{ marginBottom: '1.25rem' }}>
          <input
            type="text"
            placeholder="🔍 Search students by name, roll no, email, or course..."
            value={searchTerm}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.92rem'
            }}
          />
        </div>

        {/* Action feedback banner */}
        {statusMessage.text && (
          <div className={`alert alert-${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        {/* 1. Loading State */}
        {loading && (
          <div className="state-box loading-box">
            <div className="spinner"></div>
            <p>Loading students from database, please wait...</p>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && errorMessage && (
          <div className="alert alert-error">
            <p><strong>Error:</strong> {errorMessage}</p>
            <button
              onClick={() => fetchStudents(searchTerm)}
              className="btn btn-retry"
              style={{ marginTop: '0.75rem' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* 3. Empty State (No students found) */}
        {!loading && !errorMessage && students.length === 0 && (
          <div className="state-box empty-box">
            <div className="empty-icon">📂</div>
            <h3>No Students Found</h3>
            <p>
              {searchTerm
                ? `No student records matched "${searchTerm}".`
                : 'There are currently no student records in the database.'}
            </p>
            {isAdmin && (
              <Link to="/students" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Add Your First Student
              </Link>
            )}
          </div>
        )}

        {/* 4. Success State: Display Students Table */}
        {!loading && !errorMessage && students.length > 0 && (
          <div>
            <div className="table-summary-bar">
              <span>Total Students: <strong>{students.length}</strong></span>
              {searchTerm && <span>Filtered by: "<em>{searchTerm}</em>"</span>}
            </div>
            {/* Pass students data, edit handler, and delete handler down to StudentTable */}
            <StudentTable
              students={students}
              isAdmin={isAdmin}
              onEdit={(student) => setEditingStudent(student)}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      <EditStudentModal
        student={editingStudent}
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
        onSuccess={() => {
          fetchStudents(searchTerm);
          setEditingStudent(null);
          setStatusMessage({
            type: 'success',
            text: 'Student updated successfully!'
          });
        }}
      />
    </div>
  );
}

export default ViewStudents;
