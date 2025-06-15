import User from '../models/user.js';
import bcrypt from 'bcrypt';
import { generateTokens, verifyRefreshToken } from '../config/token.js';
import { sendLoginNotification } from '../config/email.js';
import { cacheTokens, blacklistTokens, isTokenBlacklisted } from '../services/redis.js';
import logger from '../services/logger.js';

export const Register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            logger.warn('Registration attempt with missing fields', { email });
            return res.status(400).json({ msg: "All fields are required", success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            logger.warn('Registration attempt with existing email', { email });
            return res.status(400).json({ msg: "Email already registered", success: false });
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            refreshTokens: []
        });

        const { accessToken, refreshToken } = generateTokens(user._id);
        
        user.refreshTokens.push(refreshToken);
        await user.save();

        await cacheTokens(user._id, accessToken, refreshToken);

        logger.info('User registered successfully', { userId: user._id, email: user.email });
        return res.status(201).json({
            msg: `${name}, your account was created successfully!`,
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        logger.error('Registration failed', { error: error.message, stack: error.stack });
        res.status(500).json({ msg: "Failed to register", success: false });
    }
};

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            logger.warn('Login attempt with missing credentials', { email });
            return res.status(400).json({ msg: "Fill all credentials", success: false });
        }

        const user = await User.findOne({ email });
        if (!user) {
            logger.warn('Login attempt with non-existent email', { email });
            return res.status(400).json({ msg: "Invalid email or password", success: false });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.warn('Login attempt with invalid password', { email });
            return res.status(400).json({ msg: "Invalid email or password", success: false });
        }

        const { accessToken, refreshToken } = generateTokens(user._id);

        if (user.refreshTokens.length >= 5) {
            user.refreshTokens.shift();
        }
        
        user.refreshTokens.push(refreshToken);
        await user.save();

        await cacheTokens(user._id, accessToken, refreshToken);
        await sendLoginNotification(user.email, user.name);

        logger.info('User logged in successfully', { userId: user._id, email: user.email });
        return res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            accessToken,
            refreshToken
        });
    } catch (error) {
        logger.error('Login failed', { error: error.message, stack: error.stack });
        res.status(500).json({ msg: "Failed to login", success: false });
    }
};

export const RefreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            logger.warn('Token refresh attempt without refresh token');
            return res.status(401).json({ msg: "Refresh token is required", success: false });
        }

        const isBlacklisted = await isTokenBlacklisted(refreshToken, 'refresh');
        if (isBlacklisted) {
            logger.warn('Token refresh attempt with blacklisted token');
            return res.status(401).json({ msg: "Token has been revoked", success: false });
        }

        const decoded = verifyRefreshToken(refreshToken);
        if (!decoded) {
            logger.warn('Token refresh attempt with invalid token');
            return res.status(401).json({ msg: "Invalid refresh token", success: false });
        }

        const user = await User.findById(decoded.userId);
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            logger.warn('Token refresh attempt with invalid user or token', { userId: decoded.userId });
            return res.status(401).json({ msg: "Invalid refresh token", success: false });
        }

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        await cacheTokens(user._id, newAccessToken, newRefreshToken);
        await blacklistTokens(refreshToken, refreshToken);

        logger.info('Token refreshed successfully', { userId: user._id });
        return res.json({
            success: true,
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        logger.error('Token refresh failed', { error: error.message, stack: error.stack });
        res.status(401).json({ msg: "Invalid refresh token", success: false });
    }
};

export const Logout = async (req, res) => {
    try {
        const { userId } = req.body;
        const { refreshToken } = req.body;

        const user = await User.findById(userId);
        if (user) {
            user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
            await user.save();

            const accessToken = req.headers.authorization?.split(' ')[1];
            if (accessToken) {
                await blacklistTokens(accessToken, refreshToken);
            }
            
            logger.info('User logged out successfully', { userId });
        }

        return res.json({ msg: "Logged out successfully", success: true });
    } catch (error) {
        logger.error('Logout failed', { error: error.message, stack: error.stack });
        res.status(500).json({ msg: "Failed to logout", success: false });
    }
};

