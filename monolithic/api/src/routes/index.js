import express from 'express';
import authRoutes from '../modules/identity/routes/v1/identity.routes.js';


const router = express.Router();


router.use('/v1/auth', authRoutes);


export default router;