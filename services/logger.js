import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for the logs
const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    winston.format.printf((info) => {
        const { timestamp, level, message, ...meta } = info;
        return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta,
        });
    })
);

// Create the logger instance
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    levels,
    format,
    defaultMeta: { 
        service: 'identity-service',
        environment: process.env.NODE_ENV || 'development'
    },
    transports: [
        // Console transport for all environments
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.printf(
                    (info) => `${info.timestamp} ${info.level}: ${info.message}`
                )
            ),
        }),
        
        // Rotating file transport for errors
        new winston.transports.DailyRotateFile({
            filename: path.join('logs', 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true,
        }),
        
        // Rotating file transport for all logs
        new winston.transports.DailyRotateFile({
            filename: path.join('logs', 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true,
        }),
    ],
});

// Create a stream object for Morgan integration
logger.stream = {
    write: (message) => logger.http(message.trim()),
};

// Add request ID tracking
logger.addRequestId = (req, res, next) => {
    req.id = req.headers['x-request-id'] || Math.random().toString(36).substring(7);
    next();
};

// Add a method to log HTTP requests
logger.logHttpRequest = (req, res, responseTime) => {
    logger.http({
        method: req.method,
        url: req.url,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        requestId: req.id,
        ip: req.ip,
        userAgent: req.get('user-agent'),
    });
};

// Add a method to log errors with request context
logger.logError = (error, req = null) => {
    const errorLog = {
        message: error.message,
        stack: error.stack,
        ...(req && {
            requestId: req.id,
            method: req.method,
            url: req.url,
            ip: req.ip,
        }),
    };
    logger.error(errorLog);
};

export default logger;