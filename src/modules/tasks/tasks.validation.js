import joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

export const addTask = joi
  .object({
    categoryId: generalFields.categoryId.required(),
    title: generalFields.title.required(),
    items: generalFields.items,
    content: generalFields.content,
    taskStatus: generalFields.taskStatus.required(),
    authorization: joi.string().required(),
  })
  .required();

// export const updateTask = joi
//   .object({
//     listItems: generalFields.listItems,
//     categoryId: generalFields.categoryId,
//     authorization: joi.string().required(),
//   })
//   .required();

export const deleteTask = joi
  .object({
    id: generalFields.id,
    authorization: joi.string().required(),
  })
  .required();
