import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getConnection } from '../../backend/src/db.js';
import { findUserByUsername, storeUserToken } from '../../backend/src/repositories/userRepository.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    let connection;
    try {
        connection = await getConnection();
        const { username, password } = req.body || {};

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        const user = await findUserByUsername(connection, username);
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

        await storeUserToken(connection, {
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
            message: 'Internal server error during login',
            error: error.message
        });
    } finally {
        if (connection) await connection.end();
    }
}
