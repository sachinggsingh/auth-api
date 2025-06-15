import jwt from 'jsonwebtoken';
import logger from '../services/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret-key';

export const generateTokens = (userId) => {
    try {
        const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });
        logger.debug('Tokens generated successfully', { userId });
        return { accessToken, refreshToken };
    } catch (error) {
        logger.error('Error generating tokens', {
            error: error.message,
            stack: error.stack,
            userId
        });
        throw error;
    }
};

export const verifyAccessToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        logger.debug('Access token verified successfully', { userId: decoded.id });
        return decoded;
    } catch (error) {
        logger.warn('Invalid access token', {
            error: error.message,
            token: token.substring(0, 10) + '...' // Log only first 10 chars for security
        });
        return null;
    }
};

export const verifyRefreshToken = (token) => {
    try {
        const decoded = jwt.verify(token, REFRESH_SECRET);
        logger.debug('Refresh token verified successfully', { userId: decoded.id });
        return decoded;
    } catch (error) {
        logger.warn('Invalid refresh token', {
            error: error.message,
            token: token.substring(0, 10) + '...' // Log only first 10 chars for security
        });
        return null;
    }
}; 