import { Router } from 'express';
import auth from '../../middleware/auth.js';
import * as categoryController from './controller/categories.js';
import * as VAL from './categories.validation.js';
import { validation } from '../../middleware/validation.js';
const router = Router();
router.post(
  '/',
  auth(),
  validation(VAL.addCategory),
  categoryController.addCategory
);
router.patch('/:categoryId', auth(), validation(VAL.updateCategory), categoryController.updateCategory);
router.delete('/:id', auth(), validation(VAL.deleteCategory), categoryController.deleteCategory);


router.get('/',categoryController.getPublicCategories);
router.get('/categorywithprivatetasks',auth(), categoryController.getPrivateCategory);

export default router;
