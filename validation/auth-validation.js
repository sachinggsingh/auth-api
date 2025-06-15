import Joi from 'joi';
import { validate } from 'express-validation'; 

export const loginSchema = Joi.object({
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().min(6).required().label('Password'),
}).options({ abortEarly: false });

export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required().label('Name'),
    email: Joi.string().email().required().label('Email'),
    password: Joi.string().min(6).required().label('Password'),
}).options({ abortEarly: false });

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().label('Refresh Token'),
}).options({ abortEarly: false });

export const validateLogin = validate({ body: loginSchema });
export const validateRegister = validate({ body: registerSchema });
export const validateRefreshToken = validate({ body: refreshTokenSchema });
export const validateLogout = validate({
    body: Joi.object({
        userId: Joi.string().required().label('User ID'),
    }).options({ abortEarly: false }),
});
