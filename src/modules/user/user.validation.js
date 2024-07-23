import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'

export const updatePassword = joi.object({
        oldPassword: generalFields.password,
        newPassword: generalFields.password,
        cPassword: generalFields.password.valid(joi.ref("newPassword")),
        authorization: joi.string().required()
    }).required()


