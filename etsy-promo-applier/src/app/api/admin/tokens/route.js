import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Token from '@/models/Token';
import PromoCode from '@/models/PromoCode';
import { authMiddleware } from '@/middleware/authMiddleware';
import { generateToken as generateRandomToken } from '@/lib/etsyAutomation';

// GET - Get all tokens (admin only)
export async function GET(req) {
  try {
    // Authenticate admin
    const auth = await authMiddleware(req);
    if (auth.status) return auth; // Return error response if not authenticated
    
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;
    const isUsed = searchParams.get('isUsed');
    
    // Build query
    const query = {};
    if (isUsed === 'true') query.isUsed = true;
    if (isUsed === 'false') query.isUsed = false;
    
    // Get tokens with pagination
    const tokens = await Token.find(query)
      .populate('promoCodeId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Token.countDocuments(query);
    
    return NextResponse.json({
      success: true,
      data: tokens,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Generate a new token (admin only)
export async function POST(req) {
  try {
    // Authenticate admin
    const auth = await authMiddleware(req);
    if (auth.status) return auth; // Return error response if not authenticated
    
    await dbConnect();
    
    const { promoCodeId, customToken, expiresInDays } = await req.json();
    
    // Validate input
    if (!promoCodeId) {
      return NextResponse.json(
        { success: false, message: 'Please provide a promo code ID' },
        { status: 400 }
      );
    }
    
    // Check if promo code exists
    const promoCode = await PromoCode.findById(promoCodeId);
    
    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Promo code not found' },
        { status: 404 }
      );
    }
    
    // Generate token or use custom one
    const tokenString = customToken || generateRandomToken(8);
    
    // Check if token already exists
    const existingToken = await Token.findOne({ token: tokenString });
    
    if (existingToken) {
      return NextResponse.json(
        { success: false, message: 'Token already exists' },
        { status: 400 }
      );
    }
    
    // Calculate expiration date
    let expiresAt = null;
    if (expiresInDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }
    
    // Create token
    const token = await Token.create({
      token: tokenString,
      promoCodeId,
      expiresAt: expiresAt || undefined,
    });
    
    // Populate promo code info
    await token.populate('promoCodeId');
    
    return NextResponse.json({
      success: true,
      data: token
    });
    
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
