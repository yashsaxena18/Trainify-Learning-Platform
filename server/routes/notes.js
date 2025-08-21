// routes/notes.js
const express = require('express');
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Note = require('../models/Note'); // You'll need to create this model

// Get notes for a specific course
router.get('/:courseId', protect , async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const note = await Note.findOne({ 
      user: userId, 
      course: courseId 
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'No notes found'
      });
    }

    res.json({
      success: true,
      notes: {
        content: note.content,
        updatedAt: note.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notes'
    });
  }
});

// Save/Update notes
router.post('/:courseId', protect , async (req, res) => {
  try {
    const { courseId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    let note = await Note.findOne({ 
      user: userId, 
      course: courseId 
    });

    if (note) {
      // Update existing note
      note.content = content;
      note.updatedAt = new Date();
      await note.save();
    } else {
      // Create new note
      note = new Note({
        user: userId,
        course: courseId,
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await note.save();
    }

    res.json({
      success: true,
      message: 'Notes saved successfully',
      notes: {
        content: note.content,
        updatedAt: note.updatedAt
      }
    });
  } catch (error) {
    console.error('Error saving notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save notes'
    });
  }
});

// Delete notes
router.delete('/:courseId', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    await Note.findOneAndDelete({ 
      user: userId, 
      course: courseId 
    });

    res.json({
      success: true,
      message: 'Notes deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notes'
    });
  }
});

module.exports = router;
