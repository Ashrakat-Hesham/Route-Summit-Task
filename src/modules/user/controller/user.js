import { compareSync, hashSync } from '../../../utils/HashAndCompare.js';
import userModel from '../../../../DB/model/User.model.js';
import { asyncHandler } from '../../../utils/errorHandling.js';
import categoryModel from '../../../../DB/model/Category.model.js';
import taskModel from '../../../../DB/model/Task.model.js';

export const getOwner = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const user = await userModel.findById(id).populate({
    path: 'categories',
    populate: {
      path: 'tasks',
      model: 'Task',
    },
  });
  if (!user) {
    return next(new Error('User does not exist'), { cause: 404 });
  }
  return res.json({ message: 'Done', user });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req?.user?._id;
  const user = await userModel.findById(userId);
  if (!user) {
    return next(new Error('User does not exist'), { cause: 404 });
  }
  const match = compareSync({
    plaintext: newPassword,
    hashValue: oldPassword,
  });
  if (match) {
    return next(
      new Error('In valid Password you can not enter the same old password'),
      { cause: 400 }
    );
  }
  const hashPassword = hashSync({ plaintext: newPassword });
  user.password = hashPassword;
  await user.save();
  return res.status(200).json({ message: 'Done', user });
});

export const signOut = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { status: 'Offline' },
    { new: true }
  );
  if (!user) {
    return next(new Error('User does not exist'), { cause: 404 });
  }

  return res.status(200).json({ message: 'Done', user });
});

export const deleteUser = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const category = await categoryModel.find({ owner: userId });
  category.forEach(async (element) => {
    await categoryModel.findByIdAndDelete(element._id);
  });
  const tasks = await taskModel.find({ owner: userId });
  tasks.forEach(async (element) => {
    await taskModel.findByIdAndDelete(element._id);
  });
  const user = await userModel.findByIdAndDelete(req.user._id);
  return res.status(200).json({ message: 'Done', user });
});
