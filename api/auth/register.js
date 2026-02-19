import bcrypt from 'bcryptjs';
import { createUser, findUserByUsername, findUserByEmail } from '../../backend/src/repositories/userRepository.js';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || process.env.FRONTEND_ORIGIN || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Content-Type', 'application/json');
    Object.entries(corsHeaders(req.headers.origin)).forEach(([k, v]) => res.setHeader(k, v));
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const origin = req.headers.origin || '*';
    Object.entries(corsHeaders(origin)).forEach(([k, v]) => res.setHeader(k, v));
    res.setHeader('Content-Type', 'application/json');

    const { uid, uname, username, password, email, phone } = req.body || {};
    const finalUsername = uname || username;
    const role = 'Customer';

    if (!uid || !finalUsername || !password || !email || !phone) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await findUserByUsername(finalUsername);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
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

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: 'Internal server error' });
  }
}
