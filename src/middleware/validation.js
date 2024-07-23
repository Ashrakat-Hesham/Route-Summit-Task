import joi from 'joi';
import { Types } from 'mongoose';

const validateObjectId = (value, helpers) => {
  if (!Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

export const generalFields = {
  userName: joi.string().required(),
  email: joi
    .string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 4,
      tlds: { allow: ['com', 'net'] },
    })
    .required(),
  password: joi
    .string()
    .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))
    .required()
    .messages({
      'any.required': 'Password is required',
      'string.pattern.base':
        'Password must be at least 8 characters - contain uppercase and lowercase letters and numbers -',
    }),
  cPassword: joi.string().required().valid(joi.ref('password')).messages({
    'any.required': 'Confirm password is required',
    'any.only': 'Passwords do not match',
  }),
  id: joi.string().custom(validateObjectId).required(),
  taskType: joi.string().valid('ListTask', 'TextTask').required(),
  items: joi.array(),
  content: joi.string(),
  categoryId: joi.string().custom(validateObjectId).required(),
  title: joi.string().required(),
  categoryName: joi.string().required(),
  headers: joi.string().required(),
  taskStatus: joi.string().valid('Private', 'Public').required(),
};

export const validation = (schema) => {
  return (req, res, next) => {
    const inputs = { ...req.body, ...req.query, ...req.params };

    if (req.headers?.authorization) {
      inputs.authorization = req.headers.authorization;
    }
    const validationResult = schema.validate(inputs, { abortEarly: false });

    if (validationResult.error) {
      return res.status(400).json({
        message: 'Validation error',
        errors: validationResult.error.details,
      });
    }

    req.validatedData = validationResult.value; // Attach validated data to request object
    return next();
  };
};
