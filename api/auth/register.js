import bcrypt from 'bcryptjs';
import { getConnection } from '../../backend/src/db.js';
import { createUser, findUserByUsername, findUserByEmail } from '../../backend/src/repositories/userRepository.js';

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
        const { uid, uname, username, password, email, phone } = req.body || {};
        const finalUsername = uname || username;
        const role = 'Customer';

        if (!uid || !finalUsername || !password || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const existingUser = await findUserByUsername(connection, finalUsername);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        const existingEmail = await findUserByEmail(connection, email);
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await createUser(connection, {
            uid,
            username: finalUsername,
            email,
            hashedPassword,
            phone,
            role
        });

        return res.status(201).json({
            success: true,
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
            error: error.message
        });
    } finally {
        if (connection) await connection.end();
    }
}
