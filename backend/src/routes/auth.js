const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const authController = require('../controllers/authController')
const { auth } = require('../middleware/auth')
const { validate } = require('../middleware/validate')

router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 20 }).matches(/^[a-zA-Z0-9_]+$/),
  body('email').isEmail().normalizeEmail(),
  body('phone').matches(/^[6-9]\d{9}$/),
  body('password').isLength({ min: 8 }),
], validate, authController.register)

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, authController.login)

router.post('/verify-email', body('token').notEmpty(), validate, authController.verifyEmail)
router.post('/forgot-password', body('email').isEmail().normalizeEmail(), validate, authController.forgotPassword)
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
], validate, authController.resetPassword)

router.get('/profile', auth, authController.getProfile)

module.exports = router
