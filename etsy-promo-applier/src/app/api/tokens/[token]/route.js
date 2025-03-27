import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Token from '@/models/Token';
import PromoCode from '@/models/PromoCode';
import TokenEvent from '@/models/TokenEvent';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { token } = params;
    
    // Get token by ID
    const tokenDoc = await Token.findOne({ token })
      .populate('promoCodeId')
      .lean();
    
    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, error: 'Token not found' },
        { status: 404 }
      );
    }
    
    // For security, don't return the actual promo code if the token is unused
    // This maintains the privacy protection feature of our one-time use token system
    if (!tokenDoc.isUsed) {
      tokenDoc.promoCodeId = {
        ...tokenDoc.promoCodeId,
        code: '********' // Mask the actual promo code
      };
    }
    
    return NextResponse.json({ success: true, token: tokenDoc });
  } catch (error) {
    console.error('Error fetching token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch token' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const { token } = params;
    const data = await request.json();
    
    // Find the token
    const tokenDoc = await Token.findOne({ token });
    
    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, error: 'Token not found' },
        { status: 404 }
      );
    }
    
    // If marking as used
    if (data.isUsed === true && !tokenDoc.isUsed) {
      tokenDoc.isUsed = true;
      tokenDoc.usedAt = new Date();
      
      // Add IP and user agent if available
      const headers = Object.fromEntries(request.headers);
      if (headers['x-forwarded-for']) {
        tokenDoc.ipAddress = headers['x-forwarded-for'];
      }
      if (headers['user-agent']) {
        tokenDoc.userAgent = headers['user-agent'];
      }
      
      await tokenDoc.save();
      
      // Get the promo code
      const promoCode = await PromoCode.findById(tokenDoc.promoCodeId);
      
      // Create token event
      await TokenEvent.create({
        token,
        status: 'success',
        message: 'Token used successfully',
        success: true,
        promoCode: promoCode ? promoCode.code : null,
        ipAddress: tokenDoc.ipAddress,
        userAgent: tokenDoc.userAgent
      });
      
      // Return success without revealing the actual promo code to maintain privacy
      return NextResponse.json({ 
        success: true, 
        message: 'Token marked as used',
        token: {
          ...tokenDoc.toObject(),
          promoCodeId: {
            _id: promoCode._id,
            code: '********' // Mask the actual promo code for security
          }
        }
      });
    }
    
    // For other updates
    const updatedToken = await Token.findOneAndUpdate(
      { token },
      { ...data },
      { new: true, runValidators: true }
    );
    
    return NextResponse.json({ success: true, token: updatedToken });
  } catch (error) {
    console.error('Error updating token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update token' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const { token } = params;
    
    // Delete token
    const tokenDoc = await Token.findOneAndDelete({ token });
    
    if (!tokenDoc) {
      return NextResponse.json(
        { success: false, error: 'Token not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Token deleted successfully' });
  } catch (error) {
    console.error('Error deleting token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete token' },
      { status: 500 }
    );
  }
}
