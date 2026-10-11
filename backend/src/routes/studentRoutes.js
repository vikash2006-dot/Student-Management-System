
const express = require('express');
const router = express.Router();
const {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
  deleteStudent
} = require('../controllers/studentController');

// GET /api/students - Get all students
router.get('/', getStudents);
const { addStudent, getStudents } = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/students - View & search students (accessible by authenticated user and admin)
router.get('/', protect, getStudents);

// POST /api/students - Add a new student (Admin only)
router.post('/', protect, authorizeRoles('admin'), addStudent);

// PUT /api/students/:id - Update student details (Admin only)
router.put('/:id', protect, authorizeRoles('admin'), updateStudent);

// DELETE /api/students/:id - Delete student record (Admin only)
router.delete('/:id', protect, authorizeRoles('admin'), deleteStudent);
const {
  addStudent,
  getStudents
} = require('../controllers/studentController');

router.get('/', getStudents);
// POST /api/students - Add a new student (Protected: Requires login)
router.post('/', protect, addStudent);
const {addStudent,getStudents,updateStudent} = require('../controllers/studentController');


router.get('/', getStudents);


router.post('/', addStudent);

// DELETE /api/students/:id - Delete a student
router.delete('/:id', deleteStudent);

router.put('/:id', updateStudent);

module.exports = router;


