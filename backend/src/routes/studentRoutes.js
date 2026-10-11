const express = require('express');
const router = express.Router();
const {
  getStudents,
  addStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');

// GET /api/students - Fetch all students (supports ?search= query)
router.get('/', getStudents);

// POST /api/students - Add a new student
router.post('/', addStudent);

// PUT /api/students/:id - Update an existing student
router.put('/:id', updateStudent);

// DELETE /api/students/:id - Delete a student record
router.delete('/:id', deleteStudent);

module.exports = router;
