import express from 'express';
import { initRegisterValidator, verifyRegisterValidator } from '../../validators/register.validator.js';
import { initRegisterController, verifyRegisterController } from '../../controllers/register.controller.js';
import { loginValidator } from '../../validators/login.validator.js';
import { loginController } from '../../controllers/login.js';
import { refreshTokenController } from '../../controllers/refreshToken.controller.js';


const router = express.Router();


// register
router.post('/register/init', initRegisterValidator, initRegisterController);
router.post('/register/verify', verifyRegisterValidator, verifyRegisterController);


// login
router.post('/login', loginValidator, loginController);


// refresh token
router.get('/refresh-token', refreshTokenController);


export default router;