import jwt from 'jsonwebtoken';
import { findUserBalanceByUsername } from '../../backend/src/repositories/userRepository.js';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || process.env.FRONTEND_ORIGIN || 'https://kodbank.vercel.app',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
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

    const cookies = parseCookies(req.headers.cookie);
    const cookieName = process.env.COOKIE_NAME || 'KODBANK_TOKEN';
    const token = cookies[cookieName];

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
      res.setHeader('Content-Type', 'application/json');
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }
    console.error('Balance fetch error:', error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching balance'
    });
  }
}
