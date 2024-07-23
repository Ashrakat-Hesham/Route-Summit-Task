import connectDB from '../DB/connection.js';
import authRouter from './modules/auth/auth.router.js';
import userRouter from './modules/user/user.router.js';
import tasksRouter from './modules/tasks/tasks.router.js';
import categoriesRouter from './modules/categories/categories.router.js';
import cors from 'cors';
import { globalErrorHandling } from './utils/errorHandling.js';

const initApp = (app, express) => {
  //CORS policy
  app.use(cors());

  //convert Buffer Data
  app.use(express.json({}));

  //Setup API Routing
  app.use(`/auth`, authRouter);
  app.use(`/task`, tasksRouter);
  app.use(`/category`, categoriesRouter);
  app.use(`/user`, userRouter);

  app.all('*', (req, res, next) => {
    res.send('In-valid Routing Plz check url or method');
  });

  app.use(globalErrorHandling);

  connectDB();
};

export default initApp;
