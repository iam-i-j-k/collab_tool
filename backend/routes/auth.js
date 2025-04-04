const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body; // Include role in the request body

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role
    if (role && !['viewer', 'editor'].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // 🔥 Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user with hashed password and role
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role 
    });
    await user.save();

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ username: user.name, role: user.role, token });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).json({ error: "Server error" });
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

    // Include the role in the response
    res.json({ username: user.name, role: user.role, token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT: Update User
router.put("/update", authenticateToken, async (req, res) => {
  const { name, email, password, role } = req.body;

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
    if (name) user.name = name;
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