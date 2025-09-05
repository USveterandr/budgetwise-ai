import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';

// User registration
router.post('/register', authController.register);

// User login
router.post('/login', authController.login);

export default router;
