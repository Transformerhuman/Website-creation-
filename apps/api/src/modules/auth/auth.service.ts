import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET } from '../../config/redis.js';
import db from '../../config/db.js';

export const signup = async (userData: any) => {
  const { email, phone } = userData;
  let user = await db('users').where('email', email).orWhere('phone', phone).first();
  if (!user) {
    const [newUserId] = await db('users').insert(userData).returning('id');
    user = await db('users').where('id', newUserId).first();
  }
  return { ...user, _id: user.id };
};

let failedAttempts: Record<string, number> = {};
let lockoutTimer: Record<string, any> = {};

export const login = async (username: string, password: string) => {
  const ADMIN_USER = process.env.ADMIN_USER || 'admin';
  const ADMIN_PASS = process.env.ADMIN_PASS || 'agropulse2024';

  if (failedAttempts[username] >= 3) {
    return { error: 'Too many attempts. Account locked for 5 minutes.' };
  }

  const isMatch = password === ADMIN_PASS || (ADMIN_PASS.startsWith('$2') && await bcrypt.compare(password, ADMIN_PASS));

  if (username === ADMIN_USER && isMatch) {
    failedAttempts[username] = 0;
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '2m' });
    return { token };
  } else {
    failedAttempts[username] = (failedAttempts[username] || 0) + 1;
    if (failedAttempts[username] >= 3) {
      setTimeout(() => { failedAttempts[username] = 0; }, 300000); // 5 mins
    }
    return null;
  }
};
