import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body as { username?: string; password?: string };

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET as string;

  if (username === adminUsername && password === adminPassword) {
    const token = jwt.sign({ username }, jwtSecret, { expiresIn: '8h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
}
