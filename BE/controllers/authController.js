const streamifier = require('streamifier');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cloudinary = require('../utils/cloudinary');
const passport = require('passport');

const GoogleStrategy = require('passport-google-oauth20').Strategy;
// Configure Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (accessToken, refreshToken, profile, done) => {
    try {
    // console.log('Google OAuth Profile:', profile); // Log profile for debugging
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