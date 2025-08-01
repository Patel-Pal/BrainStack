const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest');

// Register
router.post('/register',validateRequest,authController.register);
// Login
router.post('/login',validateRequest,authController.login);

module.exports = router;
