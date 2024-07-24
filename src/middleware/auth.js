import userModel from '../../DB/model/User.model.js';
import { asyncHandler } from '../utils/errorHandling.js';
import jwt from 'jsonwebtoken';

export const auth = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith(process.env.BEARER_TOKEN)) {
      return next(new Error('Invalid Bearer key', { cause: 400 }));
    }
    const token = authorization.split(process.env.BEARER_TOKEN)[1];
    if (!token) {
      return next(new Error('Invalid token', { cause: 400 }));
    }
    const decoded = jwt.sign({ token });
    if (!decoded?.id) {
      return next(new Error('Invalid token payload', { cause: 400 }));
    }
    const user = await userModel
      .findById(decoded.id)
      .select('role userName image changePasswordTime');
    if (!user) {
      return next(new Error('Not registered account', { cause: 401 }));
    }
    if (parseInt(user.changePasswordTime / 1000) > decoded.iat) {
      return next(new Error('Expired token'));
    }
    if (user.status=='Offline') {
      return next(new Error('Please sign in first', { cause: 409 }));
    }
    req.user = user;
    return next();
  });
};

export default auth;
