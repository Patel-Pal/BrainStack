const streamifier = require('streamifier');
const User = require('../models/userModel');
const Course = require('../models/courseSchema');
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../utils/cloudinary');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // console.log('Profile:', profile);
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profileImage: profile.photos[0].value || '',
          isActive: true
        });
        await user.save();
        // console.log('New user created:', user.email);
      } else {
        user.googleId = profile.id;
        user.isActive = true;
        await user.save();
        // console.log('Linked Google ID to existing user:', user.email);
      }
    } else {
      user.profileImage = profile.photos[0].value || user.profileImage;
      user.isActive = true;
      await user.save();
      // console.log('Existing user logged in:', user.email);
    }
    return done(null, user);
  } catch (err) {
    console.error('Google OAuth Strategy Error:', err);
    return done(err, null);
  }
}));

// Configure GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails && profile.emails[0] ? profile.emails[0].value : '' });
      if (!user) {
        user = new User({
          githubId: profile.id,
          name: profile.displayName || profile.username,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : `${profile.username}@github.com`,
          profileImage: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
          isActive: true
        });
        await user.save();
      } else {
        user.githubId = profile.id;
        user.isActive = true;
        await user.save();
      }
    } else {
      user.profileImage = profile.photos && profile.photos[0] ? profile.photos[0].value : user.profileImage;
      user.isActive = true;
      await user.save();
    }
    return done(null, user);
  } catch (err) {
    console.error('GitHub OAuth Strategy Error:', err);
    return done(err, null);
  }
}));

// Ensure serialize/deserialize are robust
passport.serializeUser((user, done) => {
  // console.log('Serializing user:', user._id); // Log for debugging
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      console.error('Deserialize User: User not found for ID:', id);
      return done(new Error('User not found'), null);
    }
    // console.log('Deserialized user:', user.email); // Log for debugging
    done(null, user);
  } catch (err) {
    console.error('Deserialize User Error:', err);
    done(err, null);
  }
});

exports.googleAuthCallback = async (req, res) => {
    try {
      const user = req.user;
      if (!user) {
        console.error('Google Auth Callback: No user found in req.user');
        throw new Error('User not found in session');
      }

      // console.log('Generating token for user:', user.email); // Log for debugging
      const token = jwt.sign(
        {
          userId: user._id,
          name: user.name,
          address: user.address,
          email: user.email,
          role: user.role,
          course: user.course,
          isActive: user.isActive,
          profileImage: user.profileImage,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      const isProfileComplete = Boolean(user.address && user.course);

      const redirectUrl = isProfileComplete
        ? `http://localhost:5173/?token=${token}`
        : `http://localhost:5173/complete-profile?token=${token}`;

      // console.log("Profile complete:", isProfileComplete);



      // console.log('Redirecting to:', redirectUrl); // Log for debugging
      res.redirect(redirectUrl);
    } catch (err) {
      console.error('Google Auth Callback Error:', err);
      res.redirect('http://localhost:5173/login?error=auth_failed');
    }
};

exports.githubAuthCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      console.error('GitHub Auth Callback: No user found in req.user');
      throw new Error('User not found in session');
    }

    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        address: user.address,
        email: user.email,
        role: user.role,
        course: user.course,
        isActive: user.isActive,
        profileImage: user.profileImage,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    const isProfileComplete = Boolean(user.address && user.course);

    const redirectUrl = isProfileComplete
      ? `http://localhost:5173/?token=${token}`
      : `http://localhost:5173/complete-profile?token=${token}`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error('GitHub Auth Callback Error:', err);
    res.redirect('http://localhost:5173/login?error=auth_failed');
  }
};

exports.completeProfile = async (req, res) => {
  try {
    const { address, course } = req.body;

    const updatedData = {
      address: address || undefined,
      course: course || undefined,
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updatedData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newToken = jwt.sign(
      {
        userId: updatedUser._id,
        name: updatedUser.name,
        address: updatedUser.address,
        email: updatedUser.email,
        course: updatedUser.course,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        profileImage: updatedUser.profileImage,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Profile completed successfully',
      token: newToken,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        address: updatedUser.address,
        email: updatedUser.email,
        course: updatedUser.course,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (err) {
    console.error('COMPLETE PROFILE ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

exports.googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email']
});

exports.githubAuth = passport.authenticate('github', {
  scope: ['user:email']
});

// student register
exports.register = async (req, res) => {
  try {
    const { name, address, email, password, course } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    // Upload image to Cloudinary
    let imageUrl = '';
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'eduhub_users' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url); // return image URL
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      address,
      email,
      password: hashedPassword,
      course,
      profileImage: imageUrl, // empty string if no file
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//register professor
exports.registerProfessor = async (req, res) => {
  try {
    const { name, email, password, course } = req.body;

    // Validate required fields
    if (!name || !email || !password || !course) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Validate course ID
    if (!mongoose.Types.ObjectId.isValid(course)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID'
      });
    }

    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new professor
    const professor = new User({
      name,
      email,
      password: hashedPassword,
      role: 'professor',
      course
    });

    // Save professor
    const savedProfessor = await professor.save();

    // Add professor to course's professors array
    await Course.findByIdAndUpdate(
      course,
      { $addToSet: { professors: savedProfessor._id } },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: 'Professor registered successfully',
      data: savedProfessor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// get prof info
exports.getProfessors = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const professors = await User.find({ role: 'professor' }).select('name email course isActive');
    res.status(200).json({
      message: 'Professors retrieved successfully',
      professors
    });
  } catch (err) {
    console.error('GET PROFESSORS ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//active disactive professor
exports.toggleProfessorStatus = async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin only' });
    }

    const { professorId } = req.params;
    const professor = await User.findById(professorId);

    if (!professor || professor.role !== 'professor') {
      return res.status(404).json({ message: 'Professor not found' });
    }

    professor.isActive = !professor.isActive;
    await professor.save();

    res.status(200).json({
      message: `Professor status ${professor.isActive ? 'activated' : 'deactivated'} successfully`,
      professor: {
        id: professor._id,
        name: professor.name,
        email: professor.email,
        course: professor.course,
        isActive: professor.isActive
      }
    });
  } catch (err) {
    console.error('TOGGLE PROFESSOR STATUS ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    // ✅ Store all needed fields in token payload
    const token = jwt.sign(
      {
        userId: user._id,
        name: user.name,
        address: user.address,
        email: user.email,
        role: user.role,
        course: user.course,
        isActive: user.isActive,
        profileImage: user.profileImage,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        address: user.address,
        email: user.email,
        role: user.role,
        course: user.course,
        isActive: user.isActive,
        profileImage: user.profileImage,
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

//update profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, address, password, course } = req.body;

    const updatedData = {
      name: name || undefined,
      address: address || undefined,
      course: course || undefined,
    };

    // Hash new password if provided
    if (password && password.trim() !== '') {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    // Handle profile image upload to Cloudinary
    if (req.file) {
      const imageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'eduhub_users' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });
      updatedData.profileImage = imageUrl;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updatedData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ✅ Generate new token with updated user info
    const newToken = jwt.sign(
      {
        userId: updatedUser._id,
        name: updatedUser.name,
        address: updatedUser.address,
        email: updatedUser.email,
        course: updatedUser.course,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        profileImage: updatedUser.profileImage,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      token: newToken,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        address: updatedUser.address,
        email: updatedUser.email,
        course: updatedUser.course,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (err) {
    console.error('UPDATE ERROR:', err);
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};