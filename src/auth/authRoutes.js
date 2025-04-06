
import express from 'express';
import { login, logout, forgotPassword, resetPassword, verificarToken } from './authController.js';
import { verificaToken } from './authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', verificaToken, logout);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
/* router.get('/reset-password', resetPassword); */
router.post('/verificar-token', verificarToken);
router.get('/verificar-token', verificarToken);



export default router;
