import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.SECRET) {
  throw new Error('SECRET env variable cannot be empty');
}

const { SECRET } = process.env;

export interface DecodedToken {
  decodedToken: any;
}

const getTokenFrom = (req: Request) => {
  const authorization = req.get('authorization');
  if (!(authorization && authorization.toLowerCase().startsWith('bearer '))) {
    return null;
  }

  return authorization.substring(7);
};

export const requireAdminLogin = (
  req: Request & DecodedToken,
  res: Response,
  next: () => void
) => {
  const token = getTokenFrom(req);
  if (!token) {
    return res.status(401).json({ error: 'token missing' });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, SECRET) as any;
  } catch (exception) {
    return res.status(401).json({ error: 'invalid token' });
  }

  if (!decodedToken.username) {
    return res.status(401).json({ error: 'invalid token' });
  }

  if (decodedToken.username !== 'admin') {
    return res.status(401).json({ error: 'access denied' });
  }

  req.decodedToken = decodedToken;

  next();
};

export const requireBeaconToken = (
  req: Request & DecodedToken,
  res: Response,
  next: () => void
) => {
  const token = getTokenFrom(req);
  if (!token) {
    return res.status(401).json({ error: 'token missing' });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, SECRET) as any;
  } catch (exception) {
    return res.status(401).json({ error: 'invalid token' });
  }

  if (!decodedToken.beaconId || !decodedToken.nickname) {
    return res.status(401).json({ error: 'invalid token' });
  }

  req.decodedToken = decodedToken;

  next();
};