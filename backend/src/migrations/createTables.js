import pool from '../db.js';

const createTables = async () => {
  try {
    // Create KodUser table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS KodUser (
        uid VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        balance DECIMAL(15, 2) DEFAULT 100000.00,
        phone VARCHAR(20) NOT NULL,
        role VARCHAR(50) DEFAULT 'Customer'
      )
    `);
    console.log('✓ KodUser table created successfully');

    // Create UserToken table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS UserToken (
        tid INT AUTO_INCREMENT PRIMARY KEY,
        token TEXT NOT NULL,
        uid VARCHAR(255) NOT NULL,
        expairy DATETIME NOT NULL,
        FOREIGN KEY (uid) REFERENCES KodUser(uid) ON DELETE CASCADE,
        INDEX idx_uid (uid),
        INDEX idx_expairy (expairy)
      )
    `);
    console.log('✓ UserToken table created successfully');

    console.log('All tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
};

createTables();
