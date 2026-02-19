import express from 'express';
import bcrypt from 'bcryptjs';
import { createUser, findUserByUsername, findUserByEmail } from '../../backend/src/repositories/userRepository.js';

const app = express();
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
    try {
        const { uid, uname, username, password, email, phone } = req.body || {};
        const finalUsername = uname || username;
        const role = 'Customer';

        if (!uid || !finalUsername || !password || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        const existingUser = await findUserByUsername(finalUsername);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
        }

        const existingEmail = await findUserByEmail(email);
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await createUser({
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
            message: 'Internal server error during registration'
        });
    }
});

export default app;
