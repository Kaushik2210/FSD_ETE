import { Router } from 'express';
import { register, login, getMe, toggleBookmark } from '../controllers/authController.js';
import { registerRules, loginRules, runValidation, objectIdRule } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/register', registerRules, runValidation, register);
router.post('/login', loginRules, runValidation, login);
router.get('/me', protect, getMe);
router.patch('/bookmarks/:id', protect, objectIdRule, runValidation, toggleBookmark);

export default router;
