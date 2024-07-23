import { Router } from 'express';
import auth from '../../middleware/auth.js';
import { validation } from '../../middleware/validation.js';
import * as VAL from './user.validation.js';
import * as userController from './controller/user.js';

const router = Router();

router.get('/', auth(), userController.getOwner); 
router.patch(
  '/resetpassword',
  auth(),
  validation(VAL.updatePassword),
  userController.updatePassword
); 
router.patch('/signout', auth(), userController.signOut); 
router.delete('/', auth(), userController.deleteUser); 

export default router;
