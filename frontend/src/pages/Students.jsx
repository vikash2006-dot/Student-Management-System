import React, { useState, useEffect } from 'react';
import api from '../services/api';

function Students() {
  // Form state for student details
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    course: '',
    semester: '',
    phone: ''
  });

  // State for list of students
  const [students, setStudents] = useState([]);

  // State for submission feedback and loading indicator
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Fetch students from backend on component mount
  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Update form fields on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    const { name, rollNo, email, course, semester, phone } = formData;
    if (!name || !rollNo || !email || !course || !semester || !phone) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill in all the required fields.'
      });
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/students', formData);

      setStatusMessage({
        type: 'success',
        text: response.data.message || 'Student added successfully!'
      });

      setFormData({
        name: '',
        rollNo: '',
        email: '',
        course: '',
        semester: '',
        phone: ''
      });

      // Refresh the students list after adding
      fetchStudents();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to connect to the server. Please ensure the backend is running.';

      setStatusMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle student deletion with confirmation
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the student "${name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/students/${id}`);

      setStatusMessage({
        type: 'success',
        text: 'Student deleted successfully!'
      });

      // Refresh the students list after deleting
      fetchStudents();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to delete the student. Please try again.';

      setStatusMessage({
        type: 'error',
        text: errorMessage
      });
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Add New Student</h2>
        <p className="subtitle">
          Enter student information below to add a new record to MongoDB.
        </p>

        {statusMessage.text && (
          <div className={`alert alert-${statusMessage.type}`}>
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="rollNo">Roll Number *</label>
            <input
              type="text"
              id="rollNo"
              name="rollNo"
              placeholder="e.g. 21CS001"
              value={formData.rollNo}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="e.g. john@college.edu"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="course">Course *</label>
            <input
              type="text"
              id="course"
              name="course"
              placeholder="e.g. B.Tech CSE"
              value={formData.course}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="semester">Semester *</label>
            <input
              type="text"
              id="semester"
              name="semester"
              placeholder="e.g. 6th"
              value={formData.semester}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding Student...' : 'Submit Student'}
          </button>
        </form>
      </div>

      {/* Students List Table */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2>All Students</h2>
        {students.length === 0 ? (
          <p className="subtitle">No students found. Add one above.</p>
        ) : (
          <table className="students-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>Name</th>
                <th style={{ padding: '8px' }}>Roll No</th>
                <th style={{ padding: '8px' }}>Email</th>
                <th style={{ padding: '8px' }}>Course</th>
                <th style={{ padding: '8px' }}>Semester</th>
                <th style={{ padding: '8px' }}>Phone</th>
                <th style={{ padding: '8px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{student.name}</td>
                  <td style={{ padding: '8px' }}>{student.rollNo}</td>
                  <td style={{ padding: '8px' }}>{student.email}</td>
                  <td style={{ padding: '8px' }}>{student.course}</td>
                  <td style={{ padding: '8px' }}>{student.semester}</td>
                  <td style={{ padding: '8px' }}>{student.phone}</td>
                  <td style={{ padding: '8px' }}>
                    <button
                      onClick={() => handleDelete(student._id, student.name)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Students