import bcrypt from 'bcrypt';
import pool from './db';

const insertUser = async () => {
  const username = 'admin';
  const password = 'GGOadminMHGH2025';
  const hashedPassword = await bcrypt.hash(password, 10);

  await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
  console.log('User inserted');
};

insertUser().catch(err => console.error(err));