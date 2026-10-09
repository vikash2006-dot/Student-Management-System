const express = require('express');
const router = express.Router();
const { getStudents, addStudent, deleteStudent } = require('../controllers/studentController');

// GET /api/students - Get all students
router.get('/', getStudents);

// POST /api/students - Add a new student
router.post('/', addStudent);

// DELETE /api/students/:id - Delete a student
router.delete('/:id', deleteStudent);

module.exports = router