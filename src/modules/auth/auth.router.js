import * as authController from './controller/auth.js';
import { Router } from 'express';
import { validation } from '../../middleware/validation.js';
import * as VAL from './auth.validation.js';
const router = Router();

router.post('/signup', validation(VAL.signUp), authController.signUp);
router.get('/badAccount', authController.badAccount);

router.get(
  '/confirmEmail/:token',
  validation(VAL.token),
  authController.confirmEmail
);

router.get(
  '/requestNewConfirmEmail/:token',
  validation(VAL.token),
  authController.requestNewConfirmEmail
);

router.post('/logIn', validation(VAL.login), authController.logIn);

router.patch('/sendcode', validation(VAL.sendCode), authController.sendCode);
//req for code
router.patch(
  '/forgetpassword',
  validation(VAL.forgetPassword),
  authController.forgetPassword
);

export default router;
