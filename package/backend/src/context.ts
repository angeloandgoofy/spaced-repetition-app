import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
import dotenv from 'dotenv';
import { Context } from './types';

dotenv.config();
const prisma = new PrismaClient();

interface TokenPayload {
  userId: string;
}

export function createContext({ req }: { req: Request }): Context {
  const auth = req.headers.authorization || '';
  let userId: string | null = null;

  if (auth.startsWith('Bearer ')) {
    const token = auth.slice(7); 
    
    if (token && token.trim() !== '') {
      try {
        if (!process.env.JWT_SECRET) {
          console.error('JWT_SECRET environment variable is not set');
          return { prisma, userId: null };
        }
        
        const payload = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
        userId = payload.userId;
      } catch (err) {
        if (err instanceof jwt.JsonWebTokenError) {
          console.error('Invalid JWT token:', err.message);
        } else {
          console.error('JWT verification failed:', err);
        }
      }
    }
  }

  return { prisma, userId };
}