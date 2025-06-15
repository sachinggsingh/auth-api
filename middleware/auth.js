import { verifyAccessToken } from '../config/token.js';
import User from '../models/user.js';
import { isTokenBlacklisted } from '../services/redis.js';
import logger from '../services/logger.js';

const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.warn('Authentication failed - No token provided', {
                requestId: req.id,
                ip: req.ip,
                url: req.url
            });
            return res.status(401).json({ msg: 'No token provided', success: false });
        }

        const token = authHeader.split(' ')[1];

        // Check if token is blacklisted
        const isBlacklisted = await isTokenBlacklisted(token, 'access');
        if (isBlacklisted) {
            logger.warn('Authentication failed - Token blacklisted', {
                requestId: req.id,
                ip: req.ip,
                url: req.url
            });
            return res.status(401).json({ msg: 'Token has been revoked', success: false });
        }

        const decoded = verifyAccessToken(token);
        if (!decoded) {
            logger.warn('Authentication failed - Invalid token', {
                requestId: req.id,
                ip: req.ip,
                url: req.url
            });
            return res.status(401).json({ msg: 'Invalid token', success: false });
        }

        const user = await User.findById(decoded.id).select('-password -refreshTokens');
        if (!user) {
            logger.warn('Authentication failed - User not found', {
                requestId: req.id,
                ip: req.ip,
                url: req.url,
                userId: decoded.id
            });
            return res.status(401).json({ msg: 'User not found', success: false });
        }

        logger.info('Authentication successful', {
            requestId: req.id,
            userId: user._id,
            ip: req.ip,
            url: req.url
        });

        req.user = user;
        next();
    } catch (error) {
        logger.error('Authentication error', {
            requestId: req.id,
            error: {
                message: error.message,
                stack: error.stack
            },
            ip: req.ip,
            url: req.url
        });
        res.status(500).json({ msg: 'Authentication failed', success: false });
    }
};

export default auth; 