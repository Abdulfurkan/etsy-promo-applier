import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PromoCode from '@/models/PromoCode';
import { authMiddleware } from '@/middleware/authMiddleware';

// GET - Get a specific promo code by ID (admin only)
export async function GET(req, { params }) {
  try {
    // Authenticate admin
    const auth = await authMiddleware(req);
    if (auth.status) return auth; // Return error response if not authenticated
    
    await dbConnect();
    
    const { id } = params;
    
    // Find promo code
    const promoCode = await PromoCode.findById(id);
    
    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Promo code not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: promoCode
    });
    
  } catch (error) {
    console.error('Error fetching promo code:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a promo code (admin only)
export async function PUT(req, { params }) {
  try {
    // Authenticate admin
    const auth = await authMiddleware(req);
    if (auth.status) return auth; // Return error response if not authenticated
    
    await dbConnect();
    
    const { id } = params;
    const { code, description, isActive, maxUsage } = await req.json();
    
    // Find promo code
    const promoCode = await PromoCode.findById(id);
    
    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Promo code not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    if (code) promoCode.code = code;
    if (description !== undefined) promoCode.description = description;
    if (isActive !== undefined) promoCode.isActive = isActive;
    if (maxUsage !== undefined) promoCode.maxUsage = maxUsage;
    
    // Save changes
    await promoCode.save();
    
    return NextResponse.json({
      success: true,
      data: promoCode
    });
    
  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a promo code (admin only)
export async function DELETE(req, { params }) {
  try {
    // Authenticate admin
    const auth = await authMiddleware(req);
    if (auth.status) return auth; // Return error response if not authenticated
    
    await dbConnect();
    
    const { id } = params;
    
    // Find and delete promo code
    const promoCode = await PromoCode.findByIdAndDelete(id);
    
    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Promo code not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Promo code deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
