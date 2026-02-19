import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByUsername, storeUserToken } from '../../backend/src/repositories/userRepository.js';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || process.env.FRONTEND_ORIGIN || 'https://kodbank.vercel.app',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc, pair) => {
    const [k, v] = pair.trim().split('=');
    if (k && v) acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
}

export default async function handler(req, res) {
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
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    const origin = req.headers.origin || '*';
    Object.entries(corsHeaders(origin)).forEach(([k, v]) => res.setHeader(k, v));
    res.setHeader('Content-Type', 'application/json');

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
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
}
