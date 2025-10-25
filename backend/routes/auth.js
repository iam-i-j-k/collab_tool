const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const User = require('../models/User');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/profile-images';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

const router = express.Router();

// Middleware to authenticate and extract user from token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user; // Attach user info (id, role) to the request
    next();
  });
};

router.post("/register", upload.single('profileImage'), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      gender,
      bio,
      subscribe,
      joinCommunity
    } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      // Delete uploaded file if it exists
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role
    if (role && !['viewer', 'editor'].includes(role)) {
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).json({ message: "Invalid role" });
    }

    // Validate gender
    if (gender && !['male', 'female', 'other'].includes(gender)) {
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).json({ message: "Invalid gender" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object with all fields
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || 'viewer',
      gender: gender || 'other',
      bio: bio || '',
      subscribe: subscribe === 'true' || subscribe === true,
      joinCommunity: joinCommunity === 'true' || joinCommunity === true
    };

    // Add profile image path if file was uploaded
    if (req.file) {
      userData.profileImage = `/uploads/profile-images/${req.file.filename}`;
    }

    // Save user
    const user = new User(userData);
    await user.save();

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Return success response with user data
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        bio: user.bio,
        subscribe: user.subscribe,
        joinCommunity: user.joinCommunity,
        profileImage: user.profileImage
      },
    });
  } catch (error) {
    // Delete uploaded file if there was an error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    console.error("Error in registration:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// POST: Sign In
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if the password is valid
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    // Include all necessary user data in response
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        gender: user.gender,
        bio: user.bio,
        subscribe: user.subscribe,
        joinCommunity: user.joinCommunity,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT: Update User
router.put("/update", authenticateToken, async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Find the user by ID from the token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate role if provided
    if (role && !['viewer', 'editor'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Update user fields
    if (username) user.name = username;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    if (role) user.role = role;

    // Save updated user
    await user.save();

    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE: Delete User
router.delete("/delete", authenticateToken, async (req, res) => {
  try {
    // Find and delete the user by ID from the token
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;