import joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

export const addCategory = joi
  .object({
    categoryName: generalFields.categoryName.required(),
    authorization: generalFields.headers.required(),
  })
  .required();

export const updateCategory = joi
  .object({
    categoryName: generalFields.categoryName.required(),
    authorization: generalFields.headers.required(),
    categoryId:generalFields.id
  })
  .required();

export const deleteCategory = joi
  .object({
    id: generalFields.id,
    authorization: generalFields.headers.required(),
  })
  .required();
