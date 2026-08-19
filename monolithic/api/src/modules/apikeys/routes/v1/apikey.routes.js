import express from 'express';
import { authReq } from '../../../../middlewares/authReq.middleware.js';
import { createApiKeyController } from '../../controllers/createApiKey.controller.js';
import { createApiKeyValidator } from '../../validators/createApiKey.validator.js';


const router = express.Router();


router.post('/', authReq, createApiKeyValidator, createApiKeyController);


export default router;
