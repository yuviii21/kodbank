import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByUsername, storeUserToken } from '../../backend/src/repositories/userRepository.js';

const app = express();
app.use(express.json());

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const user = await findUserByUsername(username);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        const token = jwt.sign(
            { sub: user.username, role: user.role, uid: user.uid },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );

        const decoded = jwt.decode(token);
        const expiryDate = new Date(decoded.exp * 1000);

        await storeUserToken({
            uid: user.uid,
            token,
            expiry: expiryDate
        });

        const cookieName = process.env.COOKIE_NAME || 'KODBANK_TOKEN';
        const isProd = process.env.NODE_ENV === 'production';
        const maxAge = Math.floor((decoded.exp * 1000 - Date.now()) / 1000);

        res.setHeader('Set-Cookie', `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isProd ? '; Secure' : ''}`);

        return res.json({
            success: true,
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});

export default app;
