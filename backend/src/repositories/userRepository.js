import pool from '../db.js';

export const createUser = async ({ uid, username, email, hashedPassword, phone, role = 'Customer' }) => {
  const [result] = await pool.execute(
    'INSERT INTO KodUser (uid, username, email, password, phone, role, balance) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [uid, username, email, hashedPassword, phone, role, 100000]
  );
  return result;
};

export const findUserByUsername = async (username) => {
  const [rows] = await pool.execute(
    'SELECT uid, username, email, password, balance, phone, role FROM KodUser WHERE username = ?',
    [username]
  );
  return rows[0] || null;
};

export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    'SELECT uid, username, email, password, balance, phone, role FROM KodUser WHERE email = ?',
    [email]
  );
  return rows[0] || null;
};

export const storeUserToken = async ({ uid, token, expiry }) => {
  const [result] = await pool.execute(
    'INSERT INTO UserToken (uid, token, expairy) VALUES (?, ?, ?)',
    [uid, token, expiry]
  );
  return result;
};

export const findUserBalanceByUsername = async (username) => {
  const [rows] = await pool.execute(
    'SELECT balance FROM KodUser WHERE username = ?',
    [username]
  );
  return rows[0]?.balance || null;
};
