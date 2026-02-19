import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { findUserBalanceByUsername } from '../../backend/src/repositories/userRepository.js';

const app = express();
app.use(cookieParser());

app.get('/api/user/balance', async (req, res) => {
    try {
        const cookieName = process.env.COOKIE_NAME || 'KODBANK_TOKEN';
        const token = req.cookies[cookieName];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const username = decoded.sub;

        const balance = await findUserBalanceByUsername(username);

        if (balance === null) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.json({
            success: true,
            message: 'Balance fetched successfully',
            balance
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token.'
            });
        }
        console.error('Balance fetch error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error while fetching balance'
        });
    }
});

export default app;
