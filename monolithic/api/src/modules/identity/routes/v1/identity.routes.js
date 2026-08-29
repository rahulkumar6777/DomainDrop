import express from 'express';
import { initRegisterValidator, verifyRegisterValidator } from '../../validators/register.validator.js';
import { initRegisterController, verifyRegisterController } from '../../controllers/register.controller.js';
import { loginValidator } from '../../validators/login.validator.js';
import { loginController } from '../../controllers/login.js';
import { refreshTokenController } from '../../controllers/refreshToken.controller.js';
import { logoutController } from '../../controllers/logout.controller.js';
import { changePasswordValidators } from '../../validators/changePassword.validator.js';
import { changePasswordController } from '../../controllers/changePassword.controller.js';
import { forgetPasswordValidatorsInit, forgetPasswordValidatorsVerify } from '../../validators/forgetPassword.validators.js';
import { forgetPasswordControllerInit, forgetPasswordControllerVerify } from '../../controllers/forgetPasswordController.js';


const router = express.Router();


// register
router.post('/register/init', initRegisterValidator, initRegisterController);
router.post('/register/verify', verifyRegisterValidator, verifyRegisterController);


// login
router.post('/login', loginValidator, loginController);


// refresh token
router.get('/refresh-token', refreshTokenController);

// logout
router.post('/logout', logoutController);

// changes password
router.post("/change-password", changePasswordValidators, changePasswordController)

// reset password
router.post("/forget-password/init", forgetPasswordValidatorsInit, forgetPasswordControllerInit);
router.post("/forget-password/verify", forgetPasswordValidatorsVerify, forgetPasswordControllerVerify);



export default router;
