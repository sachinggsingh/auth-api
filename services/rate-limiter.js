import rateLimit from 'express-rate-limit';
import logger from './logger.js';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    message: "Too many requests, Please try again after 15 minutes",
    statusCode: 429,
    standardHeaders: true, 
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method
        });
        res.status(429).json({
            success: false,
            message: "Too many requests, Please try again after 15 minutes"
        });
    }
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1,
    message: "Too many login attempts, please try again after an hour",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Auth rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            method: req.method,
            email: req.body.email
        });
        res.status(429).json({
            success: false,
            message: "Too many login attempts, please try again after an hour"
        });
    }
});

export { limiter, authLimiter };