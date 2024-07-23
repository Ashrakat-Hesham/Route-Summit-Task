import categoryModel from '../../../../DB/model/Category.model.js';
import { asyncHandler } from '../../../utils/errorHandling.js';
import userModel from '../../../../DB/model/User.model.js';
import { deleteOne } from '../../../utils/handlers.js';
import { pagination } from '../../../utils/pagination.js';

export const getPublicCategories = asyncHandler(async (req, res, next) => {
  const { skip, limit } = pagination(req?.query?.page, req?.query?.size);
  const helper = async (y = 1, z = 'Public') => {
    let mongooseQuery = await categoryModel
      .aggregate([
        {
          $lookup: {
            from: 'tasks',
            localField: 'listTasks',
            foreignField: '_id',
            as: 'task',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner',
          },
        },
        { $unwind: '$task' },
        { $unwind: '$owner' },
        { $match: { 'task.taskStatus': z } },
        {
          $sort: {
            categoryName: y,
          },
        },
      ])
      .skip(skip)
      .limit(limit)
      .exec();

    return res.json({ mongooseQuery });
  };

  let sort = req.query?.sort?.toString().startsWith('-') ? -1 : 1;
  let taskStatus = req.query.taskStatus ?? 'Public';
  if (taskStatus == 'Public') {
    helper(sort, taskStatus);
  } else {
    return next(
      new Error('Incorrect Id OR You are not authorized to see this content'),
      { cause: 400 }
    );
  }
});

export const getPrivateCategory = asyncHandler(async (req, res, next) => {
  const { skip, limit } = pagination(req?.query?.page, req?.query?.size);
  let taskStatus = req?.query?.taskStatus == 'Public' ? 'Public' : 'Private';
  let sort = req.query?.sort?.toString().startsWith('-') ? -1 : 1;
  const helper = async (y = 1, z) => {
    let mongooseQuery = await categoryModel
      .aggregate([
        {
          $lookup: {
            from: 'tasks',
            localField: 'listTasks',
            foreignField: '_id',
            as: 'task',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'owner',
            foreignField: '_id',
            as: 'owner',
          },
        },
        { $unwind: '$task' },
        { $unwind: '$owner' },
        { $match: { 'task.taskStatus': z } },
        { $match: { 'owner._id': req.user._id } },
        {
          $sort: {
            categoryName: y,
          },
        },
      ])
      .skip(skip)
      .limit(limit)
      .exec();
    return res.json({ mongooseQuery });
  };

  if (taskStatus == 'Public') {
    helper(sort, taskStatus);
  }
   if (taskStatus == 'Private' && req?.user?._id != undefined) {
    const userId = req.user._id;
    const user = await userModel.findById(userId);
    if (!user) {
      return next(
        new Error('Incorrect Id OR You are not authorized to see this content'),
        { cause: 400 }
      );
    }
    helper(sort, taskStatus);
  }
});

export const addCategory = asyncHandler(async (req, res, next) => {
  const { categoryName } = req.body;
  const checkCategory = await categoryModel.findOne({
    $and: [{ categoryName, owner: req.user._id }],
  });
  if (checkCategory) {
    return next(new Error(`Category already exists ${categoryName}`), {
      cause: 409,
    });
  }
  const category = await categoryModel.create({
    categoryName,
    owner: req.user._id,
  });
  return res.status(201).json({ message: 'Done', category });
});

export const updateCategory = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { categoryName } = req.body;
  const { categoryId } = req.params;
  const existedcategoryName = await categoryModel.findOne({ owner:req.user._id,categoryName });
  if (existedcategoryName) {
    return next(new Error(`categoryName already exists ${categoryName}`), {
      cause: 409,
    });
  }
  const existedCategory = await categoryModel.findOne({
    _id: categoryId,
    owner: userId,
  });
  if (!existedCategory) {
    return next(
      new Error(`CategoryId does not exist OR You are not the main owner`),
      { cause: 400 }
    );
  }
  const category = await categoryModel.findByIdAndUpdate(
    categoryId,
    { categoryName },
    { new: true }
  );
  return res.status(200).json({ message: 'Done', category });
});

export const deleteCategory = deleteOne(categoryModel, 'category');
