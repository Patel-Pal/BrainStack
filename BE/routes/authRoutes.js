const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest');
const upload = require('../middlewares/upload');
const authMiddleware = require('../middlewares/authMiddleware'); 
const passport = require('passport');

//regster
router.post('/register',upload.single('profileImage'), validateRequest,authController.register);
// Login
router.post('/login',validateRequest,authController.login);
// Update profile
router.put('/update-profile', authMiddleware, upload.single('profileImage'), validateRequest, authController.updateProfile);

router.get('/google', authController.googleAuth);
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), authController.googleAuthCallback);

router.put('/complete-profile', authMiddleware, validateRequest, authController.completeProfile);
module.exports = router;
