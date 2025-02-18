import joi from 'joi';
import { generalFields } from '../../middleware/validation.js';

export const signUp = joi
  .object({
    userName: generalFields.userName,
    email: generalFields.email,
    password: generalFields.password,
    cPassword: generalFields.cPassword,
  })
  .required();

export const token = joi.object({ token: joi.string().required() }).required();

export const login = joi
  .object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  })
  .required();

export const sendCode = joi
  .object({
    email: generalFields.email.required(),
  })
  .required();

export const forgetPassword = joi
  .object({
    forgetCode: joi
      .string()
      .pattern(new RegExp(/^[0-9]{4}$/))
      .required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    cPassword: generalFields.cPassword.valid(joi.ref('password')).required(),
  })
  .required();
