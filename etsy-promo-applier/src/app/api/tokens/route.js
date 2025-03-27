import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Token from '@/models/Token';
import PromoCode from '@/models/PromoCode';
import { randomBytes } from 'crypto';

// Generate a random token
function generateToken(length = 8) {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
}

export async function GET(request) {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const showUsed = searchParams.get('showUsed') === 'true';
    const promoCodeId = searchParams.get('promoCodeId');
    
    // Build query
    const query = {};
    if (!showUsed) {
      query.isUsed = false;
    }
    if (promoCodeId) {
      query.promoCodeId = promoCodeId;
    }
    
    // Get tokens with promo code details
    const tokens = await Token.find(query)
      .populate('promoCodeId', 'code description')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({ success: true, tokens });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    // Log the request data for debugging
    console.log('Token creation request data:', data);
    
    // Verify promo code exists
    const promoCode = await PromoCode.findById(data.promoCodeId);
    if (!promoCode) {
      console.error(`Promo code not found with ID: ${data.promoCodeId}`);
      return NextResponse.json(
        { success: false, error: 'Promo code not found' },
        { status: 404 }
      );
    }
    
    console.log('Found promo code:', promoCode);
    
    // Generate a unique token
    let token;
    let isUnique = false;
    
    while (!isUnique) {
      token = generateToken(8);
      const existingToken = await Token.findOne({ token });
      if (!existingToken) {
        isUnique = true;
      }
    }
    
    // Create token data object
    const tokenData = {
      token,
      promoCodeId: data.promoCodeId,
      isUsed: false,
      createdAt: new Date(),
      expiresAt: data.expiresAt || undefined,
    };
    
    console.log('Attempting to create token with data:', tokenData);
    
    // Create a new token
    const newToken = await Token.create(tokenData);
    
    console.log('Token created successfully:', newToken);
    
    return NextResponse.json({ success: true, token: newToken });
  } catch (error) {
    console.error('Error creating token:', error);
    
    // Provide more specific error information
    let errorMessage = 'Failed to create token';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = `Validation error: ${Object.values(error.errors).map(e => e.message).join(', ')}`;
      statusCode = 400;
    } else if (error.name === 'MongoServerError' && error.code === 11000) {
      errorMessage = 'Duplicate token error';
      statusCode = 409;
    } else if (error.name === 'MongooseError') {
      errorMessage = `Database error: ${error.message}`;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage, details: error.message },
      { status: statusCode }
    );
  }
}
