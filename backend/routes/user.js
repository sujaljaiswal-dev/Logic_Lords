const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// GET current user profile (no username disclosure)
router.get('/profile', protect, async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      languagePreference: user.languagePreference,
      locality: user.locality,
      stressLevel: user.stressLevel,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update preferences
router.put('/preferences', protect, async (req, res) => {
  try {
    const { languagePreference, locality } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { languagePreference, locality },
      { new: true }
    ).select('-password -username');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
