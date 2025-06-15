import { createClient } from 'redis';
import logger from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    }
});

client.on('error', err => logger.error('Redis Client Error', { error: err.message, stack: err.stack }));
client.on('connect', () => logger.info('Redis Client Connected'));

await client.connect();

// Test function to verify Redis connection and data storage
const testRedisConnection = async () => {
    try {
        const testKey = 'test:connection';
        const testValue = 'Redis is working!';
        
        await client.set(testKey, testValue);
        logger.info('Test data set in Redis');
        
        const retrievedValue = await client.get(testKey);
        logger.debug('Retrieved value from Redis', { value: retrievedValue });
        
        await client.del(testKey);
        logger.info('Test data cleaned up');
        
        return true;
    } catch (error) {
        logger.error('Redis connection test failed', {
            error: error.message,
            stack: error.stack
        });
        return false;
    }
};

// Helper function to cache tokens
const cacheTokens = async (userId, accessToken, refreshToken) => {
    try {
        await client.set(`access_token:${userId}`, accessToken, {
            EX: 15 * 60
        });
        logger.debug(`Access token cached for user ${userId}`);
        
        await client.set(`refresh_token:${userId}`, refreshToken, {
            EX: 24 * 60 * 60
        });
        logger.debug(`Refresh token cached for user ${userId}`);
    } catch (error) {
        logger.error('Error caching tokens', {
            error: error.message,
            stack: error.stack,
            userId
        });
        throw error;
    }
};

// Helper function to blacklist tokens
const blacklistTokens = async (accessToken, refreshToken) => {
    try {
        await client.set(`blacklist:access_token:${accessToken}`, '1', {
            EX: 15 * 60
        });
        logger.debug('Access token blacklisted');
        
        await client.set(`blacklist:refresh_token:${refreshToken}`, '1', {
            EX: 24 * 60 * 60
        });
        logger.debug('Refresh token blacklisted');
    } catch (error) {
        logger.error('Error blacklisting tokens', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
};

// Helper function to check if token is blacklisted
const isTokenBlacklisted = async (token, type = 'access') => {
    try {
        const result = await client.get(`blacklist:${type}_token:${token}`);
        return result !== null;
    } catch (error) {
        logger.error('Error checking token blacklist', {
            error: error.message,
            stack: error.stack,
            tokenType: type
        });
        throw error;
    }
};

// Helper function to get cached token
const getCachedToken = async (userId, type = 'access') => {
    try {
        return await client.get(`${type}_token:${userId}`);
    } catch (error) {
        logger.error('Error getting cached token', {
            error: error.message,
            stack: error.stack,
            userId,
            tokenType: type
        });
        throw error;
    }
};

// Run the test connection
testRedisConnection().then(success => {
    if (success) {
        logger.info('Redis connection and data storage are working correctly');
    } else {
        logger.error('Redis connection test failed. Please check your configuration');
    }
});

export { 
    client as redisClient,
    cacheTokens,
    blacklistTokens,
    isTokenBlacklisted,
    getCachedToken,
    testRedisConnection
};