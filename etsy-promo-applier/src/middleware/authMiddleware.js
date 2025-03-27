import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export function getTokenFromHeader(req) {
  // Get token from Authorization header
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  // Split Bearer from token
  return authHeader.split(' ')[1];
}

export async function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function authMiddleware(req) {
  // Get token from header
  const token = getTokenFromHeader(req);
  
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'No token provided' },
      { status: 401 }
    );
  }
  
  // Verify token
  const decoded = await verifyToken(token);
  
  if (!decoded) {
    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    );
  }
  
  // Check if user is admin
  if (!decoded.isAdmin) {
    return NextResponse.json(
      { success: false, message: 'Not authorized as admin' },
      { status: 403 }
    );
  }
  
  // User is authenticated and is admin
  return { userId: decoded.id, isAdmin: decoded.isAdmin };
}

export function generateToken(user) {
  return jwt.sign(
    { 
      id: user._id,
      username: user.username,
      isAdmin: user.isAdmin 
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}
