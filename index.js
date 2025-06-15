import express from 'express';
import { helmetConfig } from './services/helmet.js';
import { limiter, authLimiter } from './services/rate-limiter.js';
import { connectDB } from './config/db.js';
import user from './routes/user.js';
import { redisClient } from './services/redis.js';
import logger from './services/logger.js';
import { requestLogger, errorLogger } from './middleware/logging.js';

const app = express();

// Apply logging middleware first
app.use(requestLogger);

app.use(limiter);
app.use(helmetConfig);

redisClient.on('error', (err) => {
    logger.error('Redis Client Error', { error: err.message, stack: err.stack });
});

app.use(express.json());

// MongoDB Connection
connectDB().catch(err => {
    logger.error('MongoDB Connection Error', { error: err.message, stack: err.stack });
});

app.get("/", (req, res) => {
    logger.info('Root endpoint accessed', { requestId: req.id });
    res.send("Hello");
});

app.use("/api/world", limiter, (req, res) => {
    logger.info('World endpoint accessed', { requestId: req.id });
    res.json("hello World");
});

app.use("/api", authLimiter, user);

// Error handling middleware
app.use(errorLogger);

const PORT = process.env.PORT || 5555;

app.listen(PORT, () => {
    logger.info(`Server started at port ${PORT}`, { 
        port: PORT,
        environment: process.env.NODE_ENV || 'development'
    });
});