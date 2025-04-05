require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI.replace('<db_password>', process.env.DB_PASSWORD);

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists!' });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password, // In production, hash the password before saving
    });

    await user.save();
    res.status(201).json({ message: 'Signup successful!' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

app.post('/api/signup/google', async (req, res) => {
  try {
    const { name, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists!' });
    }

    // Create new Google user
    const user = new User({
      username: name,
      email,
      password: 'google-auth',
      isGoogleUser: true
    });

    await user.save();
    res.status(201).json({ message: 'Google signup successful!' });
  } catch (error) {
    console.error('Google signup error:', error);
    res.status(500).json({ message: 'Failed to register with Google' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });

    // Find user
    const user = await User.findOne({ email });
    console.log('Found user:', user);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // If it's a Google user trying to set a password for the first time
    if (user.isGoogleUser && user.password === 'google-auth') {
      console.log('Google user setting password for first time');
      try {
        // Update the user's password and isGoogleUser status
        const updatedUser = await User.findOneAndUpdate(
          { email },
          { 
            password: password,
            isGoogleUser: false
          },
          { new: true }
        );
        console.log('Updated user:', updatedUser);

        if (updatedUser) {
          return res.json({ 
            message: 'Password set successfully!', 
            username: updatedUser.username 
          });
        }
      } catch (updateError) {
        console.error('Update error:', updateError);
        return res.status(500).json({ message: 'Failed to update user credentials' });
      }
    }

    console.log('Checking password:', {
      userPassword: user.password,
      inputPassword: password,
      isMatch: user.password === password
    });

    // For regular users or Google users with already set passwords
    if (user.password === password) {
      return res.json({ message: 'Login successful!', username: user.username });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
});

app.post('/api/login/google', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ message: 'Login successful!', username: user.username });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Failed to login with Google' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 