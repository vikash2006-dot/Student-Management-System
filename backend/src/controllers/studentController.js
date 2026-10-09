const Student = require('../models/Student');

// @desc    Get all students
// @route   GET /api/students
// @access  Public
const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new student
// @route   POST /api/students
// @access  Public
const addStudent = async (req, res, next) => {
  try {
    const { name, rollNo, email, course, semester, phone } = req.body;

    if (!name || !rollNo || !email || !course || !semester || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, rollNo, email, course, semester, phone) are required'
      });
    }

    const existingStudent = await Student.findOne({ rollNo: rollNo.trim() });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: `Student with roll number "${rollNo.trim()}" already exists`
      });
    }

    const student = await Student.create({
      name: name.trim(),
      rollNo: rollNo.trim(),
      email: email.trim(),
      course: course.trim(),
      semester: semester.trim(),
      phone: phone.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Public
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with id "${id}" not found`
      });
    }

    await Student.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Student deleted successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  addStudent,
  deleteStudent
}