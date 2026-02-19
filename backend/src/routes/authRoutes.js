import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createUser, findUserByUsername, findUserByEmail, storeUserToken } from '../repositories/userRepository.js';

dotenv.config();

const router = express.Router();

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { uid, uname, username, password, email, phone } = req.body;
    const finalUsername = uname || username;
    const role = 'Customer'; // Always set to Customer

    // Validation
    if (!uid || !finalUsername || !password || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if username already exists
    const existingUser = await findUserByUsername(finalUsername);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Check if email already exists
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await createUser({
      uid,
      username: finalUsername,
      email,
      hashedPassword,
      phone,
      role
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user
    const user = await findUserByUsername(username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        sub: user.username,
        role: user.role,
        uid: user.uid
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
      }
    );

    // Calculate expiry date for database storage
    const decoded = jwt.decode(token);
    const expiryDate = new Date(decoded.exp * 1000);

    // Store token in database
    await storeUserToken({
      uid: user.uid,
      token,
      expiry: expiryDate
    });

    // Set cookie
    res.cookie(process.env.COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: decoded.exp * 1000 - Date.now()
    });

    res.json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

export default router;
