import express from 'express';
import authRoutes from '../modules/identity/routes/v1/identity.routes.js';
import apiKeyRoutes from '../modules/apikeys/routes/v1/apikey.routes.js';
import spaceRoutes from '../modules/spaces/routes/v1/space.routes.js';


const router = express.Router();


router.use('/v1/auth', authRoutes);
router.use('/v1/api-keys', apiKeyRoutes);
router.use('/v1/spaces', spaceRoutes);


export default router;
