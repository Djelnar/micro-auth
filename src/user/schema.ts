import * as Joi from 'joi'


export const schema = Joi.object().keys({
  username: Joi
    .string()
    .alphanum()
    .min(3)
    .max(24)
    .required(),
  password: Joi
    .string()
    .min(8)
    .max(64)
    .required(),
})
