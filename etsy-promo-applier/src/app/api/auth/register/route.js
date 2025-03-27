import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/middleware/authMiddleware';

export async function POST(req) {
  try {
    await dbConnect();
    
    const { username, password, adminKey } = await req.json();
    
    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide username and password' },
        { status: 400 }
      );
    }
    
    // Check if this is the first user (for initial admin setup)
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;
    
    // For non-first users, require admin key
    if (!isFirstUser) {
      const correctAdminKey = process.env.ADMIN_REGISTRATION_KEY || 'change-this-in-production';
      
      if (adminKey !== correctAdminKey) {
        return NextResponse.json(
          { success: false, message: 'Invalid admin registration key' },
          { status: 403 }
        );
      }
    }
    
    // Check if username already exists
    const existingUser = await User.findOne({ username });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Username already exists' },
        { status: 400 }
      );
    }
    
    // Create user
    const user = await User.create({
      username,
      password,
      isAdmin: true, // All registered users are admins in this app
    });
    
    // Generate JWT token
    const token = generateToken(user);
    
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
