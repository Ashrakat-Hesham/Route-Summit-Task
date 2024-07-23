import categoryModel from '../../../../DB/model/Category.model.js';
import taskModel from '../../../../DB/model/Task.model.js';
import userModel from '../../../../DB/model/User.model.js';
import { asyncHandler } from '../../../utils/errorHandling.js';
import { deleteOne } from '../../../utils/handlers.js';
import { pagination } from '../../../utils/pagination.js';

// Get all public tasks with pagination and sorting
export const getPublicTasks = asyncHandler(async (req, res, next) => {
  const { skip, limit } = pagination(req.query.page, req.query.size);
  const helper = async (y = 1, z) => {
    let mongooseQuery = await taskModel
      .aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
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
        { $unwind: '$category' },
        { $match: { taskStatus: z } },
        {
          $sort: {
            category: y,
          },
        },
      ])
      .skip(skip)
      .limit(limit)
      .exec();
    return res.json({ mongooseQuery });
  };

  let sort = req.query?.sort?.toString().startsWith('-') ? -1 : 1;
  let taskStatus = req.query.taskStatus == 'Public' ? 'Public' : 'Private';
  if (taskStatus == 'Public') {
    helper(sort, taskStatus);
  } else {
    return next(
      new Error(
        'Incorrect Id OR You are not authorized to see this content choose Public in taskStatus'
      ),
      { cause: 400 }
    );
  }
});

// Get all user-specific tasks with pagination and sorting
export const getUserTasks = asyncHandler(async (req, res, next) => {
  const { skip, limit } = pagination(req.query.page, req.query.size);
  const helper = async (y = 1, z) => {
    let mongooseQuery = await taskModel
      .aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
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
        { $unwind: '$category' },
        { $unwind: '$owner' },
        { $match: { taskStatus: z } },
        { $match: { 'owner._id': req.user._id } },
        {
          $sort: {
            category: y,
          },
        },
      ])
      .skip(skip)
      .limit(limit)
      .exec();
    return res.json({ mongooseQuery });
  };

  let sort = req.query?.sort?.toString().startsWith('-') ? -1 : 1;
  let taskStatus = req.query.taskStatus == 'Public' ? 'Public' : 'Private';

  if (taskStatus == 'Public') {
    helper(sort, taskStatus);
  } else if (taskStatus == 'Private' && req?.user?._id != undefined) {
    const user = await userModel.findOne({ _id: req?.user?._id });
    if (!user) {
      return next(
        new Error('Incorrect Id OR You are not authorized to see this content'),
        { cause: 400 }
      );
    }

    if (!(await taskModel.find({owner:req.user._id}))) {
      return next(new Error('You do not have any tasks'), { cause: 400 });
    } 
    else {
      
      taskStatus = 'Private';
      helper(sort, taskStatus);
    }
  }
});

//Add a new list of a task
export const addTask = asyncHandler(async (req, res, next) => {
  const { title, categoryId, items, content, taskStatus } = req.body;
  const userId = req.user._id;
  if (await taskModel.findOne({ title, owner: req.user._id })) {
    return next(new Error(`Task Title already exists ${title}`), {
      cause: 409,
    });
  }
  const category = await categoryModel.findOne({
    _id: categoryId,
    owner: userId,
  });
  if (!category) {
    return next(
      new Error(
        `Category does not exist or you are not the main owner of this Id ${categoryId}`
      ),
      { cause: 404 }
    );
  }
  if (items) {
    req.body.items = items;
    req.body.taskType = 'ListTask';
  }
  if (content) {
    req.body.content = content;
    req.body.taskType = 'TextTask';
  }
  if (!(content || items)) {
    return next(
      new Error(
        `You have to choose the type of task whether it is list of tasks or just one task`
      ),
      { cause: 400 }
    );
  }

  if (req.body?.taskStatus) {
    req.body?.taskStatus == taskStatus;
  }
  req.body.owner = userId;
  const task = await taskModel.create(req.body);
  // Push the task's ID to the category's tasks array
  category.listTasks.push(task._id);
  await category.save();

  return res.status(201).json({ message: 'Done', task });
});

// //Update the task
export const updateTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const userId = req.user._id;
  const { title, categoryId, items, content, taskStatus } = req.body;
  // check task availability
  const checkTask = await taskModel.findById(taskId);
  if (!checkTask) {
    return next(new Error('Task does not exist'), { cause: 400 });
  }
  // check new title == old title
  if (checkTask.title == title) {
    return next(new Error('You can not update with the same title'), {
      cause: 409,
    });
  }
  // check new title availability
  if (await taskModel.findOne({ title }, { _id: { $ne: taskId } })) {
    return next(new Error('Title must be unique'), { cause: 409 });
  }
  //check category Id
  if (
    categoryId &&
    (await categoryModel.findOne([
      { _id: categoryId },
      { owner: { $ne: userId } },
    ]))
  ) {
    return next(
      new Error(
        'You can not update while you are not the main owner OR categoryId does not exist'
      ),
      { cause: 403 }
    );
  } else {
    req.body.categoryId = categoryId;
  }
  if (items) {
    req.body.items = items;
    req.body.taskType = 'ListTask';
  }
  if (content) {
    req.body.content = content;
    req.body.taskType = 'TextTask';
  }
  if (!(content || items)) {
    return next(
      new Error(
        `You have to choose the type of task whether it is list of tasks or just one task using content or items`
      ),
      { cause: 400 }
    );
  }
  if (req.body?.taskStatus) {
    req.body?.taskStatus == taskStatus || 'Private';
  }
  const task = await taskModel.findByIdAndUpdate({ _id: taskId }, req.body, {
    new: true,
  });
  // Push the task's ID to the category's tasks array
  return res.status(200).json({ message: 'Task updated successfully', task });
});

// //Delete the task
export const deleteTask = deleteOne(taskModel, 'Task');
