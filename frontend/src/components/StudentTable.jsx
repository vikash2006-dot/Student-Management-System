import React from 'react';

// Beginner-friendly StudentTable Component
// Displays student list with Edit and Delete action controls
function StudentTable(props) {
  const { students, isAdmin, onEdit, onDelete } = props;

  // Show actions column if onEdit or onDelete is available
  const showActions = !!onEdit || (isAdmin && !!onDelete);

  return (
    <div className="table-responsive">
      <table className="student-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Roll Number</th>
            <th>Email</th>
            <th>Course</th>
            <th>Semester</th>
            <th>Phone</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {/* Loop through each student in the array */}
          {students.map((student, index) => (
            <tr key={student._id || index}>
              <td>{index + 1}</td>
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
              {showActions && (
                <td>
                  <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(student)}
                        className="btn btn-secondary btn-sm"
                        style={{
                          padding: '0.35rem 0.65rem',
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {isAdmin && onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(student._id, student.name)}
                        className="btn btn-danger btn-sm"
                        style={{
                          backgroundColor: '#dc2626',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.35rem 0.65rem',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.82rem'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentTable;
