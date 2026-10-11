import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

  // Form state for student details (used for Add and Edit)
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  // Student list state
  const [students, setStudents] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('');

  // Submission feedback and loading indicator
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

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
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Update form fields on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Open the form populated with existing student details for editing
  const handleEdit = (student) => {
    setEditId(student._id);
    setFormData({
      name: student.name || '',
      rollNo: student.rollNo || '',
      email: student.email || '',
      course: student.course || '',
      semester: student.semester || '',
      phone: student.phone || ''
    });
    setStatusMessage({ type: '', text: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing and reset form
  const handleCancel = () => {
    setEditId(null);
    setFormData(emptyForm);
    setStatusMessage({ type: '', text: '' });
  };

  // Handle form submission (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });

    // Client-side validation: ensure no empty fields
    const { name, rollNo, email, course, semester, phone } = formData;
    if (
      !name.trim() ||
      !rollNo.trim() ||
      !email.trim() ||
      !course.trim() ||
      !semester.trim() ||
      !phone.trim()
    ) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill in all the required fields.'
      });
      return;
    }

    try {
      setLoading(true);

      let response;
      if (editId) {
        // Update existing student: PUT /api/students/:id
        response = await api.put(`/students/${editId}`, {
          name: name.trim(),
          rollNo: rollNo.trim(),
          email: email.trim(),
          course: course.trim(),
          semester: semester.trim(),
          phone: phone.trim()
        });

        setStatusMessage({
          type: 'success',
          text: response.data.message || 'Student updated successfully!'
        });
      } else {
        // Add new student: POST /api/students
        response = await api.post('/students', {
          name: name.trim(),
          rollNo: rollNo.trim(),
          email: email.trim(),
          course: course.trim(),
          semester: semester.trim(),
          phone: phone.trim()
        });

        setStatusMessage({
          type: 'success',
          text: response.data.message || 'Student added successfully!'
        });
      }

      // Reset form fields
      setFormData(emptyForm);
      setEditId(null);

      // Refresh list to show updated student records
      await fetchStudents();
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
      `Are you sure you want to delete ${name}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await api.delete(`/students/${id}`);

      setStudents((prev) => prev.filter((s) => s._id !== id));

      setStatusMessage({
        type: 'success',
        text: response.data?.message || 'Student deleted successfully!'
      });

      if (editId === id) {
        handleCancel();
      }
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

  // Filter students by search and dropdowns
  const courses = Array.from(new Set(students.map((s) => s.course).filter(Boolean)));
  const semesters = Array.from(new Set(students.map((s) => s.semester).filter(Boolean)));

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      !searchQuery ||
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse = !courseFilter || student.course === courseFilter;
    const matchesSemester = !semesterFilter || student.semester === semesterFilter;

    return matchesSearch && matchesCourse && matchesSemester;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setCourseFilter('');
    setSemesterFilter('');
  };

  return (
    <div className="page-container">
      {/* Student Form Card (Add or Edit) */}
      <div className="card">
        <h2>{editId ? 'Edit Student Details' : 'Add New Student'}</h2>
        <p className="subtitle">
          {editId
            ? 'Update the student information below and save your changes.'
            : 'Enter student information below to add a new record to MongoDB.'}
        </p>

        {/* Success or error message notification */}
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

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? (editId ? 'Updating Student...' : 'Adding Student...')
                : (editId ? 'Update Student' : 'Submit Student')}
            </button>

            {editId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Student Records List with Search, Filters, Edit, and Delete Actions */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Registered Students</h2>
        <p className="subtitle">
          Search, view, edit, or delete existing student records.
        </p>

        {/* Filters and search bar */}
        <div className="student-filters" style={{ marginBottom: '1rem' }}>
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

          {(searchQuery || courseFilter || semesterFilter) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          )}
        </div>

        {fetching ? (
          <p className="status-text">Loading students from database...</p>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <p>
              {students.length === 0
                ? 'No students found. Add a student using the form above.'
                : 'No students match your search or filter criteria.'}
            </p>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td className="student-name">{student.name}</td>
                    <td>
                      <span className="badge badge-roll">{student.rollNo}</span>
                    </td>
                    <td>{student.email}</td>
                    <td>{student.course}</td>
                    <td>
                      <span className="badge badge-sem">{student.semester}</span>
                    </td>
                    <td>{student.phone}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(student)}
                          style={{ padding: '0.3rem 0.65rem', fontSize: '0.82rem' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(student._id, student.name)}
                          disabled={deletingId === student._id}
                          style={{
                            backgroundColor: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            padding: '0.3rem 0.65rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.82rem'
                          }}
                        >
                          {deletingId === student._id ? 'Deleting...' : '🗑️ Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Students;
