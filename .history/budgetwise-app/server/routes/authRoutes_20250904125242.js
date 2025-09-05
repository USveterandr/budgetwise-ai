import express from 'express';
const router = express.Router();
import { login, register } from '../controllers/authController.js';

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

export default router;
