import React from 'react';

// Beginner-friendly StudentTable Component
// Displays student list with role-based action controls (Admin only)
function StudentTable(props) {
  const { students, isAdmin, onDelete } = props;

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
            {isAdmin && <th>Action</th>}
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
              {isAdmin && (
                <td>
                  <button
                    type="button"
                    onClick={() => onDelete && onDelete(student._id, student.name)}
                    className="btn btn-danger btn-sm"
                    style={{
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.82rem'
                    }}
                  >
                    Delete
                  </button>
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

