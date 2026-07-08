import express from 'express';
import { adminLogin, requestAdminAccess } from '../controllers/adminAuthController.js';

const router = express.Router();

// POST /api/admin/auth/login
router.post('/login', adminLogin);

// POST /api/admin/auth/request-access
router.post('/request-access', requestAdminAccess);

export default router;
