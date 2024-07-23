import { Router } from 'express';
import auth from '../../middleware/auth.js';
import * as taskController from './controller/tasks.js';
import { validation } from '../../middleware/validation.js';
import * as VAL from './tasks.validation.js';

const router = Router();

router.get('/', taskController.getPublicTasks);



router.post('/',auth(),validation(VAL.addTask), taskController.addTask);
router.get('/privatetasks', auth(), taskController.getUserTasks); 
router.patch('/:taskId', auth(), validation(VAL.updateTask), taskController.updateTask);
router.delete('/:id', auth(), validation(VAL.deleteTask), taskController.deleteTask);

export default router;
