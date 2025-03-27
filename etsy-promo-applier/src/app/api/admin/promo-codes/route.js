import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PromoCode from '@/models/PromoCode';
import { authMiddleware } from '@/middleware/authMiddleware';

// GET - Get all promo codes (admin only)
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
    
    // Get promo codes with pagination
    const promoCodes = await PromoCode.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await PromoCode.countDocuments();
    
    return NextResponse.json({
      success: true,
      data: promoCodes,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new promo code (admin only)
export async function POST(req) {
  try {
    // Authenticate admin
    const auth = await authMiddleware(req);
    if (auth.status) return auth; // Return error response if not authenticated
    
    await dbConnect();
    
    const { code, description, maxUsage } = await req.json();
    
    // Validate input
    if (!code) {
      return NextResponse.json(
        { success: false, message: 'Please provide a promo code' },
        { status: 400 }
      );
    }
    
    // Check if code already exists
    const existingCode = await PromoCode.findOne({ code });
    
    if (existingCode) {
      return NextResponse.json(
        { success: false, message: 'Promo code already exists' },
        { status: 400 }
      );
    }
    
    // Create promo code
    const promoCode = await PromoCode.create({
      code,
      description,
      maxUsage: maxUsage || null,
    });
    
    return NextResponse.json({
      success: true,
      data: promoCode
    });
    
  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
