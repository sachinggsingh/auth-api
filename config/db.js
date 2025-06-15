import mongoose from 'mongoose';
import logger from '../services/logger.js';

export const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/TS_WORK');
        logger.info('Connected to MongoDB successfully');
    } catch (error) {
        logger.error('MongoDB connection failed', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};