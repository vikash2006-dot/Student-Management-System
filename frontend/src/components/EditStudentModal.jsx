import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Beginner-friendly Edit Student Modal Component
// Allows updating an existing student record with validation and error handling
function EditStudentModal({ student, isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    email: '',
    course: '',
    semester: '',
    phone: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Populate form with the selected student's existing details when modal opens
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        rollNo: student.rollNo || '',
        email: student.email || '',
        course: student.course || '',
        semester: student.semester || '',
        phone: student.phone || ''
      });
      setErrorMessage('');
      setSuccessMessage('');
    }
  }, [student, isOpen]);

  if (!isOpen || !student) {
    return null;
  }

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission to PUT /api/students/:id
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Client-side validation: Ensure all fields are filled
    const { name, rollNo, email, course, semester, phone } = formData;
    if (
      !name.trim() ||
      !rollNo.trim() ||
      !email.trim() ||
      !course.trim() ||
      !semester.trim() ||
      !phone.trim()
    ) {
      setErrorMessage('Please fill in all the required fields.');
      return;
    }

    try {
      setLoading(true);

      // Send PUT request to backend API with updated student data
      const response = await api.put(`/students/${student._id}`, {
        name: name.trim(),
        rollNo: rollNo.trim(),
        email: email.trim(),
        course: course.trim(),
        semester: semester.trim(),
        phone: phone.trim()
      });

      setSuccessMessage(response.data.message || 'Student updated successfully!');

      // Notify parent component to refresh student data after a brief pause
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(response.data.data);
        }
        if (onClose) {
          onClose();
        }
      }, 700);
    } catch (error) {
      console.error('Error updating student:', error);
      const msg =
        error.response?.data?.message ||
        'Failed to update student. Please check server connection.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Prevent clicks inside modal from closing it */}
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Student Details</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="alert alert-success">
            {successMessage}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="alert alert-error">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="student-form">
          <div className="form-group">
            <label htmlFor="edit-name">Full Name *</label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-rollNo">Roll Number *</label>
            <input
              type="text"
              id="edit-rollNo"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g. 21CS001"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-email">Email Address *</label>
            <input
              type="email"
              id="edit-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g. john@college.edu"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-course">Course *</label>
            <input
              type="text"
              id="edit-course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g. B.Tech CSE"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-semester">Semester *</label>
            <input
              type="text"
              id="edit-semester"
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g. 6th"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-phone">Phone Number *</label>
            <input
              type="tel"
              id="edit-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              disabled={loading}
              placeholder="e.g. 9876543210"
              required
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStudentModal;
