import logger from '../services/logger.js';

// Middleware to log HTTP requests
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log when the response is finished
    res.on('finish', () => {
        const responseTime = Date.now() - start;
        logger.logHttpRequest(req, res, responseTime);
    });
    
    next();
};

// Middleware to log errors
export const errorLogger = (err, req, res, next) => {
    logger.logError(err, req);
    next(err);
};

// Middleware to add request ID
export const requestIdMiddleware = (req, res, next) => {
    logger.addRequestId(req, res, next);
};

// Authentication logging middleware
export const authLogger = (req, res, next) => {
    logger.info('Authentication attempt', {
        requestId: req.id,
        method: req.method,
        url: req.url,
        ip: req.ip
    });
    next();
}; 