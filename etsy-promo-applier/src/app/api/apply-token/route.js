import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Token from '@/models/Token';
import PromoCode from '@/models/PromoCode';
import { applyEtsyPromoCode } from '@/lib/etsyAutomation';

export async function POST(req) {
  try {
    await dbConnect();
    
    const { token } = await req.json();
    
    // Validate input
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Please provide a token' },
        { status: 400 }
      );
    }
    
    // Find token
    const tokenDoc = await Token.findOne({ token }).populate('promoCodeId');
    
    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 404 }
      );
    }
    
    // Check if token is already used
    if (tokenDoc.isUsed) {
      return NextResponse.json(
        { success: false, message: 'Token has already been used' },
        { status: 400 }
      );
    }
    
    // Check if token is expired
    if (tokenDoc.expiresAt && new Date() > tokenDoc.expiresAt) {
      return NextResponse.json(
        { success: false, message: 'Token has expired' },
        { status: 400 }
      );
    }
    
    // Get promo code
    const promoCode = tokenDoc.promoCodeId;
    
    if (!promoCode) {
      return NextResponse.json(
        { success: false, message: 'Associated promo code not found' },
        { status: 404 }
      );
    }
    
    // Check if promo code is active
    if (!promoCode.isActive) {
      return NextResponse.json(
        { success: false, message: 'This promo code is no longer active' },
        { status: 400 }
      );
    }
    
    // Check if promo code has reached max usage
    if (promoCode.maxUsage !== null && promoCode.usageCount >= promoCode.maxUsage) {
      return NextResponse.json(
        { success: false, message: 'This promo code has reached its maximum usage limit' },
        { status: 400 }
      );
    }
    
    // Get client IP and user agent for tracking
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Apply the promo code to Etsy (this happens in the background)
    console.log(`Applying promo code ${promoCode.code} for token ${token}`);
    const result = await applyEtsyPromoCode(promoCode.code);
    
    // Update token and promo code regardless of result
    // (We'll mark it as used even if there was an error, to prevent repeated attempts)
    tokenDoc.isUsed = true;
    tokenDoc.usedAt = new Date();
    tokenDoc.ipAddress = ip;
    tokenDoc.userAgent = userAgent;
    await tokenDoc.save();
    
    // Increment promo code usage count
    promoCode.usageCount += 1;
    await promoCode.save();
    
    // Return result
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Promo code applied successfully'
      });
    } else {
      // Even though there was an error, we still return a 200 status
      // because the token was processed (just not successfully applied)
      return NextResponse.json({
        success: false,
        message: result.message || 'Error applying promo code'
      });
    }
    
  } catch (error) {
    console.error('Error applying token:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
