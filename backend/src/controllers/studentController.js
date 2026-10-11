const mongoose = require('mongoose');
const Student = require('../models/Student');

// @desc    Get all students from database (supports optional ?search= query)
// @route   GET /api/students
// @access  Public
const getStudents = async (req, res, next) => {
  try {
    const { search } = req.query;
    let filter = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter = {
        $or: [
          { name: regex },
          { rollNo: regex },
          { email: regex },
          { course: regex },
          { semester: regex },
          { phone: regex }
        ]
      };
    }

    // Find all matching students in MongoDB and sort newest first
    const students = await Student.find(filter).sort({ createdAt: -1 });

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

    // Validate that all required fields are present
    if (!name || !rollNo || !email || !course || !semester || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, rollNo, email, course, semester, phone) are required'
      });
    }

    // Check if a student with the same roll number already exists
    const existingStudent = await Student.findOne({ rollNo: rollNo.trim() });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: `Student with roll number "${rollNo.trim()}" already exists`
      });
    }

    // Create and save new student in MongoDB
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

// @desc    Update an existing student record
// @route   PUT /api/students/:id
// @access  Public
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, rollNo, email, course, semester, phone } = req.body;

    // Validate valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: `Student with id "${id}" not found`
      });
    }

    // Validate that all required fields are provided and non-empty
    if (
      !name?.trim() ||
      !rollNo?.trim() ||
      !email?.trim() ||
      !course?.trim() ||
      !semester?.trim() ||
      !phone?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, rollNo, email, course, semester, phone) are required'
      });
    }

    // Find student in database
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with id "${id}" not found`
      });
    }

    // Prevent duplicate roll number if updated to another student's roll number
    const duplicateStudent = await Student.findOne({
      rollNo: rollNo.trim(),
      _id: { $ne: id }
    });

    if (duplicateStudent) {
      return res.status(400).json({
        success: false,
        message: `Student with roll number "${rollNo.trim()}" already exists`
      });
    }

    // Update student fields
    student.name = name.trim();
    student.rollNo = rollNo.trim();
    student.email = email.trim();
    student.course = course.trim();
    student.semester = semester.trim();
    student.phone = phone.trim();

    await student.save();

    return res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a student record
// @route   DELETE /api/students/:id
// @access  Public
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: `Student with id "${id}" not found`
      });
    }

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with id "${id}" not found`
      });
    }

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
  updateStudent,
  deleteStudent
};
