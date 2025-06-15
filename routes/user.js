import express from 'express';
import { Login, Register, RefreshToken, Logout } from '../controller/user.js';
import { validateLogin, validateRegister, validateRefreshToken,validateLogout } from '../validation/auth-validation.js';

const router = express.Router();

router.post("/login",validateLogin, Login);
router.post("/sign-up",validateRegister, Register);
router.post("/refresh-token",validateRefreshToken, RefreshToken);
router.post("/logout",validateLogout, Logout); 

export default router;