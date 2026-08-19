import express from 'express';
import authRoutes from '../modules/identity/routes/v1/identity.routes.js';
import apiKeyRoutes from '../modules/apikeys/routes/v1/apikey.routes.js';


const router = express.Router();


router.use('/v1/auth', authRoutes);
router.use('/v1/api-keys', apiKeyRoutes);


export default router;
