import { Request, Response } from 'express';
import * as authService from './auth.service.js';
import { UserZod } from './auth.validation.js';

export const signup = async (req: Request, res: Response) => {
  try {
    const validatedData = UserZod.parse(req.body);
    const user = await authService.signup(validatedData);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.errors || err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const result = await authService.login(username, password);

  if (result && 'token' in result) {
    res.cookie('admin_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3 * 60 * 60 * 1000,
    });
    res.json({ success: true, token: result.token });
  } else if (result && 'error' in result) {
    res.status(403).json({ success: false, message: result.error });
  } else {
    res.status(401).json({ success: false, message: 'Invalid Credentials' });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('admin_token');
  res.json({ success: true });
};
