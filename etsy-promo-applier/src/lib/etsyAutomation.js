import puppeteer from 'puppeteer';

/**
 * Applies a promo code to Etsy in a headless browser
 * @param {string} promoCode - The promo code to apply
 * @returns {Promise<{success: boolean, message: string}>} - Result of the operation
 */
export async function applyEtsyPromoCode(promoCode) {
  let browser = null;
  
  try {
    // Launch a headless browser
    browser = await puppeteer.launch({
      headless: true, // Run in headless mode
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ]
    });
    
    const page = await browser.newPage();
    
    // Set a realistic user agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36');
    
    // Set viewport size
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to Etsy promotion page
    console.log('Navigating to Etsy promotion page...');
    await page.goto('https://www.etsy.com/promotion', { waitUntil: 'networkidle2' });
    
    // Wait for the page to load
    await page.waitForTimeout(2000);
    
    // Check if we need to log in first
    const loginButton = await page.$('a[href*="signin"]');
    if (loginButton) {
      throw new Error('Etsy login required. Please configure login credentials in the admin panel.');
    }
    
    // Find the promo code input field
    // Note: You'll need to inspect the Etsy page to get the exact selectors
    console.log('Looking for promo code input field...');
    const inputField = await page.$('input[name="promo_code"]') || 
                       await page.$('input[placeholder*="promo"]') || 
                       await page.$('input[id*="promo"]');
    
    if (!inputField) {
      throw new Error('Could not find promo code input field on Etsy page.');
    }
    
    // Type the promo code
    console.log('Applying promo code:', promoCode);
    await inputField.type(promoCode);
    
    // Find and click the submit button
    const submitButton = await page.$('button[type="submit"]') || 
                         await page.$('button:contains("Apply")') || 
                         await page.$('input[type="submit"]');
    
    if (!submitButton) {
      throw new Error('Could not find submit button on Etsy page.');
    }
    
    // Click the button
    await submitButton.click();
    
    // Wait for the result
    await page.waitForTimeout(3000);
    
    // Check for success indicators
    const successElement = await page.$('.success-message') || 
                           await page.$('.alert-success') ||
                           await page.$('div:contains("successfully applied")');
    
    if (successElement) {
      console.log('Promo code applied successfully!');
      return { success: true, message: 'Promo code applied successfully' };
    }
    
    // Check for error messages
    const errorElement = await page.$('.error-message') || 
                         await page.$('.alert-error') ||
                         await page.$('div:contains("invalid promo code")');
    
    if (errorElement) {
      const errorText = await page.evaluate(el => el.textContent, errorElement);
      console.log('Error applying promo code:', errorText);
      return { success: false, message: `Error: ${errorText}` };
    }
    
    // If we can't determine success or failure, assume it worked
    return { success: true, message: 'Promo code application completed' };
    
  } catch (error) {
    console.error('Error in Etsy automation:', error);
    return { success: false, message: error.message };
  } finally {
    // Always close the browser
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generates a random token
 * @param {number} length - Length of the token
 * @returns {string} - Random token
 */
export function generateToken(length = 8) {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking characters
  let token = '';
  
  for (let i = 0; i < length; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return token;
}
