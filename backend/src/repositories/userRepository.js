export const createUser = async (connection, { uid, username, email, hashedPassword, phone, role = 'Customer' }) => {
  const [result] = await connection.execute(
    'INSERT INTO KodUser (uid, username, email, password, phone, role, balance) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [uid, username, email, hashedPassword, phone, role, 100000]
  );
  return result;
};

export const findUserByUsername = async (connection, username) => {
  const [rows] = await connection.execute(
    'SELECT uid, username, email, password, balance, phone, role FROM KodUser WHERE username = ?',
    [username]
  );
  return rows[0] || null;
};

export const findUserByEmail = async (connection, email) => {
  const [rows] = await connection.execute(
    'SELECT uid, username, email, password, balance, phone, role FROM KodUser WHERE email = ?',
    [email]
  );
  return rows[0] || null;
};

export const storeUserToken = async (connection, { uid, token, expiry }) => {
  const [result] = await connection.execute(
    'INSERT INTO UserToken (uid, token, expairy) VALUES (?, ?, ?)',
    [uid, token, expiry]
  );
  return result;
};

export const findUserBalanceByUsername = async (connection, username) => {
  const [rows] = await connection.execute(
    'SELECT balance FROM KodUser WHERE username = ?',
    [username]
  );
  return rows[0]?.balance || null;
};
