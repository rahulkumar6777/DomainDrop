import express from 'express';
import { initRegisterValidator, verifyRegisterValidator } from '../../validators/register.validator.js';
import { initRegisterController, verifyRegisterController } from '../../controllers/register.controller.js';


const router = express.Router();


// register
router.post('/register/init', initRegisterValidator, initRegisterController);
router.post('/register/verify', verifyRegisterValidator, verifyRegisterController);


export default router;