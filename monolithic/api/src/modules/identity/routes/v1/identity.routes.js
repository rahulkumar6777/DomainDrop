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
import {
    listSessionsController,
    revokeOtherSessionsController,
    revokeSessionController,
} from '../../controllers/sessions.controller.js';
import { authReq } from '../../../../middlewares/authReq.middleware.js';
import { sessionIdValidator } from '../../validators/session.validator.js';


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
router.post("/change-password", authReq, changePasswordValidators, changePasswordController)

// reset password
router.post("/forget-password/init", forgetPasswordValidatorsInit, forgetPasswordControllerInit);
router.post("/forget-password/verify", forgetPasswordValidatorsVerify, forgetPasswordControllerVerify);


// users sessions
router.get("/sessions", authReq, listSessionsController);
router.delete("/sessions/others", authReq, revokeOtherSessionsController);
router.delete("/sessions/:sessionId", authReq, sessionIdValidator, revokeSessionController);

export default router;
