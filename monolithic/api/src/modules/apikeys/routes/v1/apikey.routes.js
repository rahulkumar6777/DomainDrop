import express from 'express';
import { authReq } from '../../../../middlewares/authReq.middleware.js';
import { createApiKeyController } from '../../controllers/createApiKey.controller.js';
import { getApiKeysController } from '../../controllers/getApiKeys.controller.js';
import { getApiKeyUsageController } from '../../controllers/getApiKeyUsage.controller.js';
import { revokeApiKeyController } from '../../controllers/revokeApiKey.controller.js';
import { createApiKeyValidator } from '../../validators/createApiKey.validator.js';
import { apiKeyIdValidator, getApiKeyUsageValidator } from '../../validators/apiKey.validator.js';


const router = express.Router();


router.post('/', authReq, createApiKeyValidator, createApiKeyController);
router.get('/', authReq, getApiKeysController);
router.get('/:apiKeyId/usage', authReq, getApiKeyUsageValidator, getApiKeyUsageController);
router.delete('/:apiKeyId', authReq, apiKeyIdValidator, revokeApiKeyController);


export default router;
