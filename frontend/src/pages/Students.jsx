import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import React, { useState, useEffect } from 'react';
import api from '../services/api';

const emptyForm = {
  name: '',
  rollNo: '',
  email: '',
  course: '',
  semester: '',
  phone: ''
};

function Students() {
  // Check authenticated user and role
  // Form state
  // Check if user is logged in
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

  // Form state for student details
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    course: '',
    semester: '',
    phone: ''
  });

  // Student records and filters
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');

  // Submission feedback and loading
  // State for list of students
  const [students, setStudents] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // State for submission feedback and loading indicator
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    type: '',
    text: ''
  });

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
  // Fetch students from backend on mount
  const fetchStudents = async () => {
    try {
      setFetching(true);
      const response = await api.get('/students');
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setFetching(false);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Get students from the backend
  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data.data);
    } catch (err) {
      setError('Could not load students');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Update form fields on input change
  // Update form values when typing
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Fetch students from the backend
  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data.data || []);
    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: 'Failed to load students. Please check the backend.'
      });
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Get unique courses and semesters for dropdowns
  const courses = [
    ...new Set(
      students.map((student) => student.course).filter(Boolean)
    )
  ];

  const semesters = [
    ...new Set(
      students.map((student) => student.semester).filter(Boolean)
    )
  ];

  // Search and filter student records
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      (student.name || '').toLowerCase().includes(query) ||
      (student.rollNo || '').toLowerCase().includes(query) ||
      (student.email || '').toLowerCase().includes(query);

    const matchesCourse =
      !courseFilter || student.course === courseFilter;

    const matchesSemester =
      !semesterFilter || student.semester === semesterFilter;

    return matchesSearch && matchesCourse && matchesSemester;
  });

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setCourseFilter('');
    setSemesterFilter('');
  };

  // Submit the new student form
  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatusMessage({ type: '', text: '' });
  // Open the form with existing student details
  const handleEdit = (student) => {
    setEditId(student._id);

    setFormData({
      name: student.name,
      rollNo: student.rollNo,
      email: student.email,
      course: student.course,
      semester: student.semester,
      phone: student.phone
    });

    setMessage('');
    setError('');
  };

  // Cancel editing
  const handleCancel = () => {
    setEditId(null);
    setFormData(emptyForm);
    setMessage('');
    setError('');
  };

  // Add or update a student
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure user is authenticated and is an admin
    if (!token) {
      setStatusMessage({
        type: 'error',
        text: 'Access denied. Please log in before adding a student.'
      });
      return;
    }

    if (!isAdmin) {
      setStatusMessage({
        type: 'error',
        text: 'Access denied: Only administrators are authorized to add students.'
      });
      return;
    }

    // Client-side validation: ensure no empty fields
    const { name, rollNo, email, course, semester, phone } = formData;

    if (!name || !rollNo || !email || !course || !semester || !phone) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill in all the required fields.'
      });
      return;
    }
    setMessage('');
    setError('');

    try {
      setLoading(true);

      const response = await api.post('/students', formData);

      setStatusMessage({
        type: 'success',
        text: response.data.message || 'Student added successfully!'
      });

      // Clear the form
      setFormData({
        name: '',
        rollNo: '',
        email: '',
        course: '',
        semester: '',
        phone: ''
      });

      // Refresh the student list
      await fetchStudents();
      // Refresh list to show newly added student
      fetchStudents();
    } catch (error) {
      if (error.response?.status === 403) {
        setStatusMessage({
          type: 'error',
          text: 'Access denied: You do not have permission to add students. Administrator role required.'
        });
      } else if (error.response?.status === 401) {
        setStatusMessage({
          type: 'error',
          text: 'Session expired or not authenticated. Please log in again.'
        });
      } else {
        const errorMessage =
          error.response?.data?.message ||
          'Failed to connect to the server. Please ensure the backend is running.';

        setStatusMessage({
          type: 'error',
          text: errorMessage
        });
      }
      const errorMessage =
        error.response?.data?.message ||
        'Failed to connect to the server. Please ensure the backend is running.';

      setStatusMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
      let response;

      if (editId) {
        // Update the selected student
        response = await api.put(
          `/students/${editId}`,
          formData
        );
      } else {
        // Add a new student
        response = await api.post('/students', formData);
      }

      setMessage(response.data.message);

      setFormData(emptyForm);
      setEditId(null);

      // Refresh the student list
      await fetchStudents();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Something went wrong'
      );
    }
  };

  // Handle student deletion with confirmation
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await api.delete(`/students/${id}`);

      // Update the displayed list only after successful deletion
      setStudents((prevStudents) =>
        prevStudents.filter((student) => student._id !== id)
      );

      setStatusMessage({
        type: 'success',
        text: response.data?.message || 'Student deleted successfully!'
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to delete the student. Please try again.';

      setStatusMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page-container">
      {/* Add Student Form */}
      <div className="card">
        <h2>Add New Student</h2>

        <p className="subtitle">
          Enter student information below to add a new record to MongoDB.
        </p>
        <h2>{editId ? 'Edit Student' : 'Add New Student'}</h2>

        {/* Not Logged In Warning */}
        {!token && (
          <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span>🔒 <strong>Login Required:</strong> You must be logged in as an administrator to add a student record.</span>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
              Log In Now
            </Link>
          </div>
        )}

        {/* Non-Admin Warning */}
        {token && !isAdmin && (
          <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span>🚫 <strong>Admin Access Required:</strong> Your account has regular user permissions. Only administrators can add new students.</span>
            <Link to="/view-students" className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
              View Students
            </Link>
          </div>
        )}

        {/* Success or error message notification */}
        {statusMessage.text && (
          <div className={`alert alert-${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        {message && (
          <div className="alert alert-success">{message}</div>
        )}

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        {/* Render form only if logged in as admin */}
        {isAdmin && (
        <form onSubmit={handleSubmit} className="student-form">

          <div className="form-group">
            <label>Full Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading || !token}
              required
            />
          </div>

          <div className="form-group">
            <label>Roll Number *</label>
            <input
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              disabled={loading || !token}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading || !token}
              required
            />
          </div>

          <div className="form-group">
            <label>Course *</label>
            <input
              name="course"
              value={formData.course}
              onChange={handleChange}
              disabled={loading || !token}
              required
            />
          </div>

          <div className="form-group">
            <label>Semester *</label>
            <input
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              disabled={loading || !token}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading || !token}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding Student...' : 'Submit Student'}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Adding Student...' : 'Submit Student'}
          <button type="submit" className="btn btn-primary" disabled={loading || !token}>
            {loading ? 'Adding Student...' : !token ? '🔒 Please Log In to Submit' : 'Submit Student'}
          <button type="submit" className="btn btn-primary">
            {editId ? 'Update Student' : 'Add Student'}
          </button>

          {editId && (
            <button
              type="button"
              className="btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
        </form>
        )}

      </div>

      {/* Existing Students List */}
      <div className="card student-list-card">
        <h2>Existing Students</h2>
        <p className="subtitle">
          View all registered students or delete a record.
        </p>

        {fetching ? (
          <p className="status-text">Loading students...</p>
        ) : students.length === 0 ? (
          <div className="empty-state">
            <p>No student records found. Add a student using the form above.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Semester</th>
                  <th>Phone</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.rollNo}</td>
                    <td>{student.email}</td>
                    <td>{student.course}</td>
                    <td>{student.semester}</td>
                    <td>{student.phone}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(student._id, student.name)}
                        disabled={deletingId === student._id}
                      >
                        {deletingId === student._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      <div className="card" style={{ marginTop: '24px' }}>
        <h2>Student List</h2>

        {students.length === 0 ? (
          <p>No students found.</p>
        ) : (
          students.map((student) => (
            <div
              key={student._id}
              style={{
                borderBottom: '1px solid #ddd',
                padding: '16px 0'
              }}
            >
              <h3>{student.name}</h3>
              <p>Roll Number: {student.rollNo}</p>
              <p>Email: {student.email}</p>
              <p>Course: {student.course}</p>
              <p>Semester: {student.semester}</p>
              <p>Phone: {student.phone}</p>

              <button
                className="btn btn-primary"
                onClick={() => handleEdit(student)}
              >
                Edit
              </button>
            </div>
          ))
        )}
      </div>

      {/* Student Records, Search and Filters */}
      <div className="card">
        <h2>Student Records</h2>

        <p className="subtitle">
          Search by name, roll number, or email. Filter by course or semester.
        </p>

        <div className="student-filters">
          <input
            type="text"
            placeholder="Search name, roll number, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search students"
          />

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            aria-label="Filter by course"
          >
            <option value="">All Courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>

          <select
            value={semesterFilter}
            onChange={(e) => setSemesterFilter(e.target.value)}
            aria-label="Filter by semester"
          >
            <option value="">All Semesters</option>
            {semesters.map((semester) => (
              <option key={semester} value={semester}>
                {semester}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-primary"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        <p>
          Showing {filteredStudents.length} of {students.length} students
        </p>

        {filteredStudents.length === 0 ? (
          <p>
            {students.length === 0
              ? 'No students found. Add a student using the form above.'
              : 'No students match your search or filters.'}
          </p>
        ) : (
          <div className="student-list">
            {filteredStudents.map((student) => (
              <div
                className="student-record"
                key={student._id || student.rollNo}
              >
                <h3>{student.name}</h3>
                <p><strong>Roll Number:</strong> {student.rollNo}</p>
                <p><strong>Email:</strong> {student.email}</p>
                <p><strong>Course:</strong> {student.course}</p>
                <p><strong>Semester:</strong> {student.semester}</p>
                <p><strong>Phone:</strong> {student.phone || 'Not provided'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>

  );
}

export default Students;

