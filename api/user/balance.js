import jwt from 'jsonwebtoken';
import { getConnection } from '../../backend/src/db.js';
import { findUserBalanceByUsername } from '../../backend/src/repositories/userRepository.js';

export default async function handler(req, res) {
    console.log("Function started");
    if (req.method !== 'GET') {
        return res.status(405).json({
            success: false,
            message: 'Method not allowed'
        });
    }

    let connection;
    try {
        const cookieHeader = req.headers.cookie || '';
        const cookieName = process.env.COOKIE_NAME || 'KODBANK_TOKEN';

        // Simple cookie parser
        const cookies = Object.fromEntries(
            cookieHeader.split('; ').map(c => {
                const [k, ...v] = c.split('=');
                return [k, v.join('=')];
            })
        );

        const token = cookies[cookieName];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const username = decoded.sub;

        connection = await getConnection();
        const balance = await findUserBalanceByUsername(connection, username);

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
            message: 'Internal server error while fetching balance',
            error: error.message
        });
    } finally {
        if (connection) await connection.end();
    }
}
